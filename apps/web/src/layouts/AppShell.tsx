import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import { Icon, type IconName } from '../components/Icon';
import { Brand } from '../components/ui';

const navigation: { label: string; to: string; icon: IconName; group: string }[] = [
  { label: 'Visão geral', to: '/app/overview', icon: 'overview', group: 'workspace' },
  { label: 'Produtos', to: '/app/products', icon: 'box', group: 'catalog' },
  { label: 'Categorias', to: '/app/categories', icon: 'tag', group: 'catalog' },
  { label: 'Ingredientes', to: '/app/ingredients', icon: 'leaf', group: 'catalog' },
  { label: 'Estoque', to: '/app/inventory', icon: 'warehouse', group: 'operations' },
  { label: 'Movimentações', to: '/app/movements', icon: 'movement', group: 'operations' },
  { label: 'Receitas', to: '/app/recipes', icon: 'chef', group: 'operations' },
  { label: 'Alertas', to: '/app/alerts', icon: 'alert', group: 'operations' },
];

const routeTitles = new Map([
  ['/app/overview', 'Visão geral'],
  ['/app/products', 'Produtos'],
  ['/app/categories', 'Categorias'],
  ['/app/ingredients', 'Ingredientes'],
  ['/app/inventory', 'Estoque'],
  ['/app/movements', 'Movimentações'],
  ['/app/recipes', 'Receitas'],
  ['/app/alerts', 'Alertas'],
  ['/app/profile', 'Meu perfil'],
  ['/app/company', 'Empresa'],
  ['/app/users', 'Usuários e permissões'],
  ['/app/settings', 'Configurações'],
  ['/app/accept-invitation', 'Aceitar convite'],
]);

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell() {
  const { activeCompanyId, memberships, selectCompany, session, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const mobileCloseButton = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);
  const location = useLocation();
  const title = routeTitles.get(location.pathname) ?? 'PULSO';
  const activeMembership = memberships.find((item) => item.companyId === activeCompanyId);

  useEffect(() => {
    if (!mobileOpen) {
      if (wasMobileOpen.current) mobileMenuButton.current?.focus();
      wasMobileOpen.current = false;
      return;
    }

    wasMobileOpen.current = true;
    mobileCloseButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key !== 'Tab') return;

      const focusable = sidebar.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !sidebar.current?.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !sidebar.current?.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}${mobileOpen ? ' app-shell--mobile-open' : ''}`}>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Fechar menu de navegação" onClick={closeMobile} type="button" />}
      <aside
        aria-label="Navegação da aplicação"
        aria-modal={mobileOpen || undefined}
        className="sidebar"
        id="primary-navigation"
        ref={sidebar}
        role={mobileOpen ? 'dialog' : undefined}
      >
        <div className="sidebar__brand">
          <Link aria-label="PULSO — visão geral" to="/app/overview" onClick={closeMobile}><Brand compact={collapsed} /></Link>
          <button className="sidebar__collapse icon-button" aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'} onClick={() => setCollapsed((value) => !value)} type="button">
            <Icon name="menu" size={18} />
          </button>
          <button ref={mobileCloseButton} className="sidebar__mobile-close icon-button" aria-label="Fechar menu" onClick={closeMobile} type="button"><Icon name="close" /></button>
        </div>
        <nav className="sidebar__nav" aria-label="Navegação principal">
          <p className="sidebar__label">WORKSPACE</p>
          {navigation.filter((item) => item.group === 'workspace').map((item) => (
            <NavItem key={item.to} {...item} onClick={closeMobile} />
          ))}
          <p className="sidebar__label">CATÁLOGO</p>
          {navigation.filter((item) => item.group === 'catalog').map((item) => (
            <NavItem key={item.to} {...item} onClick={closeMobile} />
          ))}
          <p className="sidebar__label">OPERAÇÃO</p>
          {navigation.filter((item) => item.group === 'operations').map((item) => (
            <NavItem key={item.to} {...item} onClick={closeMobile} />
          ))}
          <p className="sidebar__label">ADMINISTRAÇÃO</p>
          <NavLink aria-label="Usuários e permissões" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={closeMobile} title="Usuários e permissões" to="/app/users">
            <Icon name="users" size={18} /><span>Usuários e permissões</span>
          </NavLink>
          <NavLink aria-label="Empresa" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={closeMobile} title="Empresa" to="/app/company">
            <Icon name="building" size={18} /><span>Empresa</span>
          </NavLink>
          <NavLink aria-label="Configurações" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={closeMobile} title="Configurações" to="/app/settings">
            <Icon name="settings" size={18} /><span>Configurações</span>
          </NavLink>
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar__support">
            <span className="sidebar__support-icon"><Icon name="pulse" size={18} /></span>
            <div><strong>Estamos em evolução</strong><span>Novos recursos em breve</span></div>
          </div>
          <NavLink className={({ isActive }) => `profile-mini${isActive ? ' profile-mini--active' : ''}`} to="/app/profile">
            <span className="avatar">{initials(session?.user.name ?? 'PULSO')}</span>
            <span className="profile-mini__copy"><strong>{session?.user.name ?? 'Usuário'}</strong><small>{activeMembership?.role ?? 'Conta'}</small></span>
            <Icon name="chevron" size={16} />
          </NavLink>
        </div>
      </aside>

      <main aria-hidden={mobileOpen} className="main-area" inert={mobileOpen}>
        <header className="topbar">
          <div className="topbar__left">
            <button
              ref={mobileMenuButton}
              aria-controls="primary-navigation"
              aria-expanded={mobileOpen}
              className="mobile-menu icon-button"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Icon name="menu" />
            </button>
            <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={13} /><strong>{title}</strong></div>
          </div>
          <div className="topbar__actions">
            <label className="company-select-wrap">
              <span className="sr-only">Empresa selecionada</span>
              <Icon name="building" size={16} />
              <select aria-label="Selecionar empresa" value={activeCompanyId ?? ''} onChange={(event) => selectCompany(event.target.value)} disabled={memberships.length === 0}>
                {memberships.length === 0 && <option value="">Nenhuma empresa</option>}
                {memberships.map((membership) => <option key={membership.companyId} value={membership.companyId}>{membership.companyName}</option>)}
              </select>
              <Icon name="chevron" size={14} />
            </label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notificações" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)} type="button">
                <Icon name="bell" size={19} />
              </button>
              {notificationsOpen && (
                <div className="notification-popover" role="status">
                  <strong>Notificações</strong>
                  <p>A central será conectada quando a API de notificações estiver disponível.</p>
                </div>
              )}
            </div>
            <Link className="topbar__avatar" aria-label="Abrir meu perfil" to="/app/profile">{initials(session?.user.name ?? 'P')}</Link>
            <button className="icon-button topbar__logout" aria-label="Sair da conta" onClick={logout} type="button"><Icon name="logout" size={18} /></button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}

function NavItem({
  label,
  to,
  icon,
  onClick,
}: {
  label: string;
  to: string;
  icon: IconName;
  onClick(): void;
}) {
  return (
    <NavLink aria-label={label} className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClick} title={label} to={to}>
      <Icon name={icon} size={18} /><span>{label}</span>
    </NavLink>
  );
}
