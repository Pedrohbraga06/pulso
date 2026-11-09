import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { LoginPage, RegisterPage } from '../features/auth/AuthPages';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import {
  CategoriesPage,
  IngredientsPage,
  ProductsPage,
} from '../features/catalog/CatalogPages';
import {
  AlertsPage,
  InventoryPage,
  MovementsPage,
  RecipesPage,
} from '../features/operations/OperationsPages';
import {
  AcceptInvitationPage,
  CompanyPage,
  ProfilePage,
  SettingsPage,
  UsersPage,
} from '../features/admin/AdminPages';
import { AppShell } from '../layouts/AppShell';
import { EmptyState } from '../components/ui';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate replace state={{ from: location }} to="/login" />;
}

function RedirectAuthenticated() {
  const { isAuthenticated } = useAuth();
  return <Navigate replace to={isAuthenticated ? '/app/overview' : '/login'} />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate replace to="/app/overview" /> : children;
}

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <EmptyState
        description="A página pode ter sido movida ou não existe."
        icon="search"
        title="Não encontramos esse caminho"
      />
      <a className="button button--secondary" href="/app/overview">Voltar para o início</a>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RedirectAuthenticated />} path="/" />
      <Route element={<PublicOnly><LoginPage /></PublicOnly>} path="/login" />
      <Route element={<PublicOnly><RegisterPage /></PublicOnly>} path="/register" />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />} path="/app">
          <Route index element={<Navigate replace to="overview" />} />
          <Route element={<DashboardPage />} path="overview" />
          <Route element={<ProductsPage />} path="products" />
          <Route element={<CategoriesPage />} path="categories" />
          <Route element={<IngredientsPage />} path="ingredients" />
          <Route element={<InventoryPage />} path="inventory" />
          <Route element={<MovementsPage />} path="movements" />
          <Route element={<RecipesPage />} path="recipes" />
          <Route element={<AlertsPage />} path="alerts" />
          <Route element={<ProfilePage />} path="profile" />
          <Route element={<CompanyPage />} path="company" />
          <Route element={<UsersPage />} path="users" />
          <Route element={<SettingsPage />} path="settings" />
          <Route element={<AcceptInvitationPage />} path="accept-invitation" />
          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Route>
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
