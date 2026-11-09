import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type {
  AcceptedCompanyInvitation,
  AuthProfileResponse,
  CompanyInvitationSummary,
  CompanyMemberDetails,
  CompanyMembershipSummary,
  CompanyRole,
  CreatedCompanyInvitation,
} from '@pulso/contracts';
import { useAuth } from '../../app/AuthContext';
import { Icon } from '../../components/Icon';
import {
  Badge,
  Button,
  DemoBanner,
  EmptyState,
  FormField,
  InlineNotice,
  LoadingState,
  PageHeader,
  Panel,
} from '../../components/ui';
import { ApiError } from '../../services/api';

function messageFrom(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Não foi possível concluir a solicitação. Tente novamente.';
}

function useCompanyPath(suffix: string): string | null {
  const { activeCompanyId } = useAuth();
  return activeCompanyId
    ? `/companies/${encodeURIComponent(activeCompanyId)}${suffix}`
    : null;
}

export function ProfilePage() {
  const { request, session } = useAuth();
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    request<AuthProfileResponse>('/auth/me')
      .then((result) => { if (active) setProfile(result); })
      .catch((requestError: unknown) => { if (active) setError(messageFrom(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey, request]);

  return (
    <>
      <PageHeader description="Informações fornecidas pela sessão autenticada." eyebrow="ADMINISTRAÇÃO" title="Meu perfil" action={<Button icon="refresh" onClick={() => setReloadKey((value) => value + 1)} type="button" variant="secondary">Atualizar</Button>} />
      {loading ? <LoadingState label="Carregando perfil da API…" /> : error ? <InlineNotice tone="danger">{error}</InlineNotice> : profile && (
        <div className="admin-grid">
          <Panel className="profile-card" title="Dados da conta" subtitle="Leitura real da API /auth/me">
            <div className="profile-large"><span className="avatar avatar--large">{initials(profile.user.name)}</span><div><h2>{profile.user.name}</h2><p>{profile.user.email}</p></div></div>
            <dl className="detail-list"><div><dt>Nome</dt><dd>{profile.user.name}</dd></div><div><dt>E-mail</dt><dd>{profile.user.email}</dd></div><div><dt>Identificador</dt><dd className="table-code">{profile.user.id}</dd></div></dl>
            <InlineNotice>Esta API oferece consulta do perfil. Edição de nome, e-mail ou senha não está disponível.</InlineNotice>
          </Panel>
          <Panel title="Empresas vinculadas" subtitle="Memberships retornadas pela API">
            {profile.memberships.length === 0 ? <EmptyState description="Sua conta ainda não tem empresas vinculadas." icon="building" title="Nenhuma empresa" /> : <div className="membership-list">{profile.memberships.map((membership) => <div className="membership-row" key={membership.companyId}><span className="membership-row__icon"><Icon name="building" /></span><span><strong>{membership.companyName}</strong><small>{membership.companyId}</small></span><Badge tone={membership.role === 'OWNER' ? 'info' : 'neutral'}>{membership.role}</Badge></div>)}</div>}
          </Panel>
        </div>
      )}
      {!session && <InlineNotice tone="warning">Sessão não encontrada; entre novamente.</InlineNotice>}
    </>
  );
}

export function CompanyPage() {
  const { activeCompanyId, request } = useAuth();
  const [companies, setCompanies] = useState<CompanyMembershipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    request<CompanyMembershipSummary[]>('/companies')
      .then((result) => { if (active) setCompanies(result); })
      .catch((requestError: unknown) => { if (active) setError(messageFrom(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [request]);

  const selected = companies.find((company) => company.companyId === activeCompanyId);
  return (
    <>
      <PageHeader description="Contexto de empresa retornado pelo seu vínculo autenticado." eyebrow="ADMINISTRAÇÃO" title="Empresa" />
      {loading ? <LoadingState label="Carregando empresas da API…" /> : error ? <InlineNotice tone="danger">{error}</InlineNotice> : (
        <div className="admin-grid">
          <Panel title="Empresa selecionada" subtitle="GET /companies · membership do usuário autenticado">
            {selected ? <div className="company-profile"><span className="company-profile__mark"><Icon name="building" size={26} /></span><div><p className="eyebrow">EMPRESA ATIVA</p><h2>{selected.companyName}</h2><Badge tone={selected.role === 'OWNER' ? 'info' : 'neutral'}>{selected.role}</Badge></div><dl className="detail-list"><div><dt>Vinculada em</dt><dd>{new Date(selected.createdAt).toLocaleDateString('pt-BR')}</dd></div><div><dt>Empresa ID</dt><dd className="table-code">{selected.companyId}</dd></div></dl></div> : <EmptyState description="Selecione uma empresa vinculada na barra superior." icon="building" title="Nenhuma empresa selecionada" />}
          </Panel>
          <Panel title="Dados da empresa" subtitle="Edição não disponível na API atual">
            <EmptyState description="O backend atual permite listar seus vínculos, mas ainda não oferece edição do nome ou configurações da empresa." icon="settings" title="Configurações somente leitura" />
          </Panel>
        </div>
      )}
    </>
  );
}

export function UsersPage() {
  const { activeCompanyId, request, requestVoid, session } = useAuth();
  const membersPath = useCompanyPath('/members');
  const invitationsPath = useCompanyPath('/invitations');
  const activeRole = session?.memberships.find((item) => item.companyId === activeCompanyId)?.role;
  const canManage = activeRole === 'OWNER' || activeRole === 'ADMIN';
  const [members, setMembers] = useState<CompanyMemberDetails[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyRole>('MEMBER');
  const [createdInvitation, setCreatedInvitation] = useState<CreatedCompanyInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!membersPath) {
      setLoading(false);
      setMembers([]);
      setInvitations([]);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    const load = async () => {
      const memberRows = await request<CompanyMemberDetails[]>(membersPath);
      const inviteRows = canManage && invitationsPath
        ? await request<CompanyInvitationSummary[]>(invitationsPath)
        : [];
      if (active) {
        setMembers(memberRows);
        setInvitations(inviteRows);
      }
    };
    load()
      .catch((requestError: unknown) => { if (active) setError(messageFrom(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage, invitationsPath, membersPath, reloadKey, request]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitationsPath) return;
    setFormError('');
    setCreatedInvitation(null);
    try {
      const created = await request<CreatedCompanyInvitation>(invitationsPath, {
        method: 'POST',
        body: { email: email.trim(), role: inviteRole },
      });
      setCreatedInvitation(created);
      setEmail('');
      reload();
    } catch (requestError) {
      setFormError(messageFrom(requestError));
    }
  }

  async function changeRole(member: CompanyMemberDetails, role: CompanyRole) {
    if (!membersPath) return;
    setFormError('');
    try {
      await request<CompanyMemberDetails>(`${membersPath}/${encodeURIComponent(member.id)}/role`, {
        method: 'PATCH',
        body: { role },
      });
      reload();
    } catch (requestError) {
      setFormError(messageFrom(requestError));
    }
  }

  async function removeMember(member: CompanyMemberDetails) {
    if (!membersPath || !window.confirm(`Remover ${member.name} da empresa?`)) return;
    setFormError('');
    try {
      await requestVoid(`${membersPath}/${encodeURIComponent(member.id)}`, { method: 'DELETE' });
      reload();
    } catch (requestError) {
      setFormError(messageFrom(requestError));
    }
  }

  async function revokeInvitation(invitation: CompanyInvitationSummary) {
    if (!invitationsPath || !window.confirm('Revogar este convite?')) return;
    setFormError('');
    try {
      await requestVoid(`${invitationsPath}/${encodeURIComponent(invitation.id)}`, { method: 'DELETE' });
      reload();
    } catch (requestError) {
      setFormError(messageFrom(requestError));
    }
  }

  async function copyInvitationToken() {
    if (!createdInvitation) return;
    try {
      await navigator.clipboard.writeText(createdInvitation.token);
      setCopied(true);
    } catch {
      setFormError('Não foi possível copiar automaticamente. Selecione e copie o token exibido.');
    }
  }

  return (
    <>
      <PageHeader description="Gerencie vínculos e convites usando a API de memberships existente." eyebrow="ADMINISTRAÇÃO" title="Usuários e permissões" action={<Button icon="refresh" onClick={reload} type="button" variant="secondary">Atualizar</Button>} />
      {!activeCompanyId && <InlineNotice tone="warning">Selecione uma empresa vinculada para consultar usuários.</InlineNotice>}
      {activeCompanyId && !canManage && <InlineNotice>Você pode consultar os membros desta empresa. A API exige OWNER ou ADMIN para convidar, alterar papéis ou remover vínculos.</InlineNotice>}
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}
      {formError && <InlineNotice tone="danger">{formError}</InlineNotice>}
      {loading ? <LoadingState label="Carregando usuários da API…" /> : (
        <>
          <Panel className="catalog-panel" title="Membros" subtitle={`${members.length} vínculo(s) retornado(s) pela API`}>
            {members.length === 0 ? <EmptyState description="A lista usa GET /companies/:companyId/members." icon="users" title="Nenhum membro encontrado" /> : (
              <div className="table-scroll"><table className="data-table"><thead><tr><th>Pessoa</th><th>Papel</th><th>Vínculo desde</th>{canManage && <th>Ações</th>}</tr></thead><tbody>
                {members.map((member) => {
                  const isSelf = member.userId === session?.user.id;
                  const canEdit = canManage && !(activeRole === 'ADMIN' && member.role === 'OWNER');
                  return <tr key={member.id}><td><span className="member-cell"><span className="avatar">{initials(member.name)}</span><span><strong className="table-primary">{member.name}</strong><small className="table-secondary">{member.email}{isSelf ? ' · Você' : ''}</small></span></span></td><td>{canEdit ? <label className="sr-only" htmlFor={`role-${member.id}`}>Papel de {member.name}</label> : null}{canEdit ? <select className="role-select" id={`role-${member.id}`} onChange={(event) => void changeRole(member, event.target.value as CompanyRole)} value={member.role}><option value="OWNER">OWNER</option><option value="ADMIN">ADMIN</option><option value="MEMBER">MEMBER</option></select> : <Badge tone={member.role === 'OWNER' ? 'info' : 'neutral'}>{member.role}</Badge>}</td><td>{new Date(member.createdAt).toLocaleDateString('pt-BR')}</td>{canManage && <td><button className="text-button text-button--danger" disabled={!canEdit} onClick={() => void removeMember(member)} type="button">Remover</button></td>}</tr>;
                })}
              </tbody></table></div>
            )}
          </Panel>

          {canManage && (
            <div className="admin-grid admin-grid--secondary">
              <Panel title="Convidar pessoa" subtitle="A API cria um token; não envia e-mail">
                <form className="invite-form" onSubmit={(event) => void createInvitation(event)}>
                  <FormField autoComplete="email" id="invite-email" label="E-mail" onChange={(event) => setEmail(event.target.value)} placeholder="pessoa@empresa.com" required type="email" value={email} />
                  <label className="form-field" htmlFor="invite-role"><span className="form-field__label">Papel do convite</span><select id="invite-role" onChange={(event) => setInviteRole(event.target.value as CompanyRole)} value={inviteRole}><option value="MEMBER">MEMBER</option><option value="ADMIN">ADMIN</option>{activeRole === 'OWNER' && <option value="OWNER">OWNER</option>}</select></label>
                  <Button icon="plus" type="submit">Criar convite</Button>
                </form>
                {createdInvitation && <div className="invitation-token"><InlineNotice tone="warning">Token exibido uma única vez. Compartilhe com segurança; ele não será mostrado novamente.</InlineNotice><code>{createdInvitation.token}</code><Button icon="copy" onClick={() => void copyInvitationToken()} type="button" variant="secondary">{copied ? 'Copiado' : 'Copiar token'}</Button><small>Convite válido até {new Date(createdInvitation.expiresAt).toLocaleDateString('pt-BR')}.</small></div>}
              </Panel>
              <Panel title="Convites" subtitle="Lista retornada pela API; o token não é recuperável">
                {invitations.length === 0 ? <EmptyState description="Convites criados aparecem aqui enquanto ativos ou concluídos." icon="mail" title="Nenhum convite" /> : <div className="invitation-list">{invitations.map((invitation) => <div className="invitation-row" key={invitation.id}><span className="invitation-row__icon"><Icon name="mail" size={17} /></span><span className="invitation-row__copy"><strong>{invitation.email ?? 'Convite sem e-mail específico'}</strong><small>{invitation.role} · expira {new Date(invitation.expiresAt).toLocaleDateString('pt-BR')}</small></span><Badge tone={invitation.acceptedAt ? 'success' : invitation.revokedAt ? 'danger' : 'warning'}>{invitation.acceptedAt ? 'Aceito' : invitation.revokedAt ? 'Revogado' : 'Pendente'}</Badge>{!invitation.acceptedAt && !invitation.revokedAt && <button className="text-button text-button--danger" onClick={() => void revokeInvitation(invitation)} type="button">Revogar</button>}</div>)}</div>}
              </Panel>
            </div>
          )}
        </>
      )}
      <AcceptInvitationCard />
    </>
  );
}

function AcceptInvitationCard() {
  const { refreshProfile, request } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState<AcceptedCompanyInvitation | null>(null);
  const [busy, setBusy] = useState(false);

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setAccepted(null);
    setBusy(true);
    try {
      const result = await request<AcceptedCompanyInvitation>('/invitations/accept', {
        method: 'POST',
        body: { token: token.trim() },
      });
      setAccepted(result);
      setToken('');
      await refreshProfile();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="accept-invitation-panel" title="Aceitar convite" subtitle="POST /invitations/accept · exige sessão autenticada">
      <form className="accept-invitation-form" onSubmit={(event) => void accept(event)}>
        <FormField autoComplete="off" id="invitation-token" label="Token do convite" onChange={(event) => setToken(event.target.value)} placeholder="Cole o token recebido" required value={token} />
        <Button disabled={busy} type="submit">{busy ? 'Validando…' : 'Aceitar convite'}</Button>
      </form>
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}
      {accepted && <InlineNotice tone="success">Convite aceito. Você agora tem vínculo {accepted.role} com {accepted.companyName}.</InlineNotice>}
    </Panel>
  );
}

export function AcceptInvitationPage() {
  return (
    <>
      <PageHeader description="Aceite um convite usando o token recebido e sua sessão ativa." eyebrow="ADMINISTRAÇÃO" title="Aceitar convite" />
      <AcceptInvitationCard />
      <InlineNotice tone="warning">O token é sensível. Não o compartilhe publicamente nem o inclua em capturas de tela.</InlineNotice>
    </>
  );
}

export function SettingsPage() {
  return (
    <>
      <DemoBanner />
      <PageHeader description="Preferências visuais e recursos em evolução." eyebrow="ADMINISTRAÇÃO" title="Configurações" />
      <div className="settings-grid">
        <Panel title="Preferências" subtitle="Ainda sem endpoint para persistência">
          <div className="settings-row"><div><strong>Resumo semanal</strong><small>Receba uma visão da operação.</small></div><button aria-label="Resumo semanal indisponível" className="switch" disabled role="switch" aria-checked="false" type="button"><span /></button></div>
          <div className="settings-row"><div><strong>Alertas de estoque</strong><small>Os critérios ainda dependem de aprovação.</small></div><button aria-label="Alertas indisponíveis" className="switch" disabled role="switch" aria-checked="false" type="button"><span /></button></div>
        </Panel>
        <Panel title="Integrações" subtitle="Nenhum conector operacional disponível">
          <EmptyState description="As integrações serão apresentadas quando houver endpoints e políticas aprovadas." icon="settings" title="Sem integrações conectadas" />
        </Panel>
      </div>
    </>
  );
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}
