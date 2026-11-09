import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AuthSessionResponse } from '@pulso/contracts';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './AuthProvider';

const session: AuthSessionResponse = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: { id: 'user-1', email: 'owner@pulso.test', name: 'Pessoa Proprietária' },
  memberships: [
    { companyId: 'company-1', companyName: 'Restaurante Aurora', role: 'OWNER' },
    { companyId: 'company-2', companyName: 'Restaurante Brisa', role: 'OWNER' },
  ],
};

function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('app routes and authentication', () => {
  it('returns to a requested protected route after login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(session)));
    const user = userEvent.setup();

    renderAt('/app/products');

    expect(screen.getByRole('heading', { name: 'Acesse sua conta' })).toBeTruthy();
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Produtos' })).toBeTruthy();
  });

  it('logs in through the API and navigates to the product catalog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(session));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAt('/login');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'O pulso da sua operação' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'owner@pulso.test', password: 'uma-senha-segura' }),
      }),
    );

    await user.click(screen.getByRole('link', { name: 'Produtos' }));
    expect(await screen.findByRole('heading', { name: 'Produtos' })).toBeTruthy();
    expect(screen.getByText(/produtos demonstrativos/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Novo produto' }));
    await screen.findByRole('dialog', { name: 'Cadastro de produto' });
    const closeButton = screen.getByRole('button', { name: 'Fechar' });
    expect(document.activeElement).toBe(closeButton);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Entendi' }));
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Novo produto' }));

    await user.click(screen.getByRole('link', { name: 'Categorias' }));
    await user.click(screen.getByRole('button', { name: /Ingredientes/ }));
    expect(await screen.findByRole('heading', { name: 'Hortifruti' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Pratos principais' })).toBeNull();
  });

  it('shows API authentication errors without entering the application', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      response({ message: 'Credenciais inválidas.' }, 401),
    ));
    const user = userEvent.setup();

    renderAt('/login');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'senha-incorreta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciais inválidas.')).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'O pulso da sua operação' })).toBeNull();
    });
  });

  it('does not show stale member data after another company fails to load', async () => {
    const companyOneMember = {
      id: 'membership-1',
      companyId: 'company-1',
      userId: 'user-2',
      email: 'member@aurora.test',
      name: 'Pessoa Aurora',
      role: 'MEMBER',
      createdAt: '2026-01-10T00:00:00.000Z',
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith('/auth/login')) return response(session);
      if (url.endsWith('/companies/company-1/members')) return response([companyOneMember]);
      if (url.endsWith('/companies/company-1/invitations')) return response([]);
      if (url.endsWith('/companies/company-2/members')) {
        return response({ message: 'Sem acesso à empresa 2.' }, 403);
      }
      return response({ message: 'Rota inesperada.' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAt('/app/users');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Pessoa Aurora')).toBeTruthy();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Selecionar empresa' }), 'company-2');

    expect(await screen.findByText('Sem acesso à empresa 2.')).toBeTruthy();
    expect(screen.queryByText('Pessoa Aurora')).toBeNull();
  });

  it('hides a created invitation token when switching companies', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.endsWith('/auth/login')) return response(session);
      if (url.endsWith('/companies/company-1/members')) return response([]);
      if (url.endsWith('/companies/company-1/invitations') && init?.method === 'POST') {
        return response({
          id: 'invitation-1',
          companyId: 'company-1',
          email: 'new-member@aurora.test',
          role: 'MEMBER',
          expiresAt: '2026-07-01T00:00:00.000Z',
          revokedAt: null,
          acceptedAt: null,
          createdAt: '2026-06-20T00:00:00.000Z',
          token: 'sensitive-one-time-token',
        });
      }
      if (url.endsWith('/companies/company-1/invitations')) return response([]);
      if (url.endsWith('/companies/company-2/members')) {
        return response({ message: 'Sem acesso à empresa 2.' }, 403);
      }
      return response({ message: 'Rota inesperada.' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAt('/app/users');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Usuários e permissões' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Convidar pessoa' })).toBeTruthy();
    await user.type(screen.getByLabelText('E-mail', { selector: 'input' }), 'new-member@aurora.test');
    await user.click(screen.getByRole('button', { name: 'Criar convite' }));
    expect(await screen.findByText('sensitive-one-time-token')).toBeTruthy();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Selecionar empresa' }), 'company-2');

    expect(await screen.findByText('Sem acesso à empresa 2.')).toBeTruthy();
    expect(screen.queryByText('sensitive-one-time-token')).toBeNull();
  });
});
