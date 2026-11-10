import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type {
  AuthSessionResponse,
  InventoryItemResponse,
  InventoryMovementResponse,
} from '@pulso/contracts';
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
    expect(screen.getByText(/produtos na amostra$/i)).toBeTruthy();

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

  it('supports keyboard access and navigation in the responsive sidebar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(session)));
    const user = userEvent.setup();

    renderAt('/login');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const menuButton = await screen.findByRole('button', { name: 'Abrir menu' });
    await user.click(menuButton);
    expect(screen.getByRole('dialog', { name: 'Navegação da aplicação' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar menu' }));

    await user.keyboard('{Escape}');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton);

    await user.click(menuButton);
    await user.click(screen.getByRole('link', { name: 'Estoque' }));
    expect(await screen.findByRole('heading', { name: 'Estoque' })).toBeTruthy();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters recipe demonstrations by search and status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(session)));
    const user = userEvent.setup();

    renderAt('/app/recipes');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Bowl da casa')).toBeTruthy();
    await user.type(screen.getByPlaceholderText('Buscar receita...'), 'molho');
    expect(screen.getByText('Molho de manjericão')).toBeTruthy();
    expect(screen.queryByText('Cookie de cacau')).toBeNull();
    await user.selectOptions(screen.getByLabelText('Filtrar fichas por status'), 'Publicada');
    expect(screen.getByRole('heading', { name: 'Nenhuma ficha encontrada' })).toBeTruthy();
  });

  it('filters company inventory returned by the API by status', async () => {
    const items: InventoryItemResponse[] = [
      {
        id: 'item-tomato',
        companyId: 'company-1',
        name: 'Tomate italiano',
        unit: 'kg',
        quantityOnHand: '8.4',
        minimumQuantity: '4',
        status: 'HEALTHY',
        isActive: true,
        createdAt: '2026-11-09T12:00:00.000Z',
        updatedAt: '2026-11-09T12:00:00.000Z',
      },
      {
        id: 'item-cheese',
        companyId: 'company-1',
        name: 'Queijo parmesão',
        unit: 'kg',
        quantityOnHand: '2',
        minimumQuantity: '2',
        status: 'AT_MINIMUM',
        isActive: true,
        createdAt: '2026-11-09T12:00:00.000Z',
        updatedAt: '2026-11-09T12:00:00.000Z',
      },
    ];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (input.toString().endsWith('/auth/login')) return response(session);
      if (input.toString().endsWith('/companies/company-1/inventory-items')) {
        return response(items);
      }
      return response({ message: 'Rota inesperada.' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAt('/app/inventory');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Tomate italiano')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Filtrar estoque por situação'), 'Atenção');
    expect(screen.getByText('Queijo parmesão')).toBeTruthy();
    expect(screen.queryByText('Tomate italiano')).toBeNull();
  });

  it('creates inventory movements through the selected company API', async () => {
    const item: InventoryItemResponse = {
      id: 'item-tomato',
      companyId: 'company-1',
      name: 'Tomate italiano',
      unit: 'kg',
      quantityOnHand: '0',
      minimumQuantity: '2',
      status: 'BELOW_MINIMUM',
      isActive: true,
      createdAt: '2026-11-09T12:00:00.000Z',
      updatedAt: '2026-11-09T12:00:00.000Z',
    };
    const movement: InventoryMovementResponse = {
      id: 'movement-1',
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      actorUserId: 'user-1',
      actorName: 'Pessoa Proprietária',
      type: 'ENTRY',
      quantity: '2.5',
      countedQuantity: null,
      delta: '2.5',
      beforeQuantity: '0',
      afterQuantity: '2.5',
      reason: 'Reposição de fornecedor',
      createdAt: '2026-11-09T12:30:00.000Z',
    };
    let movementCreated = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.endsWith('/auth/login')) return response(session);
      if (url.endsWith('/companies/company-1/inventory-items')) {
        return response([item]);
      }
      if (url.endsWith('/companies/company-1/inventory-movements')) {
        return response(movementCreated ? [movement] : []);
      }
      if (
        url.endsWith(`/inventory-items/${item.id}/movements`) &&
        init?.method === 'POST'
      ) {
        movementCreated = true;
        return response(movement);
      }
      return response({ message: 'Rota inesperada.' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAt('/app/movements');
    await user.type(screen.getByLabelText('E-mail'), 'owner@pulso.test');
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await user.click(await screen.findByRole('button', { name: 'Nova movimentação' }));
    await user.type(screen.getByLabelText('Quantidade (kg)'), '2.5');
    await user.type(screen.getByLabelText('Motivo'), 'Reposição de fornecedor');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(await screen.findByText('Reposição de fornecedor')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/companies/company-1/inventory-items/item-tomato/movements',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'ENTRY',
          quantity: '2.5',
          reason: 'Reposição de fornecedor',
        }),
      }),
    );
  });
});
