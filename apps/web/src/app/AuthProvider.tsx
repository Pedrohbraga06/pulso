import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthProfileResponse,
  AuthSessionResponse,
} from '@pulso/contracts';
import type { ApiRequestOptions } from '../services/api';
import { apiRequest, apiRequestVoid, ApiError } from '../services/api';
import { AuthContext, type AuthContextValue } from './AuthContext';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegistrationDetails extends LoginCredentials {
  name: string;
  companyName: string;
}

function firstCompanyId(session: AuthSessionResponse): string | null {
  return session.memberships[0]?.companyId ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionResponse | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const establishSession = useCallback((nextSession: AuthSessionResponse) => {
    setSession(nextSession);
    setActiveCompanyId(firstCompanyId(nextSession));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setActiveCompanyId(null);
  }, []);

  const login = useCallback(
    async (input: LoginCredentials) => {
      const nextSession = await apiRequest<AuthSessionResponse>('/auth/login', {
        method: 'POST',
        body: input,
      });
      establishSession(nextSession);
    },
    [establishSession],
  );

  const register = useCallback(
    async (input: RegistrationDetails) => {
      const nextSession = await apiRequest<AuthSessionResponse>(
        '/auth/register',
        { method: 'POST', body: input },
      );
      establishSession(nextSession);
    },
    [establishSession],
  );

  const refreshProfile = useCallback(async () => {
    if (!session) throw new ApiError('Sua sessão não está ativa.', 401);
    try {
      const profile = await apiRequest<AuthProfileResponse>('/auth/me', {
        token: session.accessToken,
      });
      setSession((current) => current ? { ...current, ...profile } : current);
      setActiveCompanyId((currentCompanyId) => (
        profile.memberships.some((membership) => membership.companyId === currentCompanyId)
          ? currentCompanyId
          : profile.memberships[0]?.companyId ?? null
      ));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) logout();
      throw error;
    }
  }, [logout, session]);

  const selectCompany = useCallback(
    (companyId: string) => {
      if (!session?.memberships.some((membership) => membership.companyId === companyId)) {
        throw new Error('Selecione uma empresa vinculada à sua conta.');
      }
      setActiveCompanyId(companyId);
    },
    [session],
  );

  const request = useCallback(
    async <T,>(
      path: string,
      options: Omit<ApiRequestOptions, 'token'> = {},
    ) => {
      if (!session) throw new ApiError('Sua sessão não está ativa.', 401);
      try {
        return await apiRequest<T>(path, {
          ...options,
          token: session.accessToken,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    [logout, session],
  );

  const requestVoid = useCallback(
    async (
      path: string,
      options: Omit<ApiRequestOptions, 'token'> = {},
    ) => {
      if (!session) throw new ApiError('Sua sessão não está ativa.', 401);
      try {
        await apiRequestVoid(path, { ...options, token: session.accessToken });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    [logout, session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      activeCompanyId,
      memberships: session?.memberships ?? [],
      isAuthenticated: session !== null,
      login,
      register,
      refreshProfile,
      logout,
      selectCompany,
      request,
      requestVoid,
    }),
    [
      activeCompanyId,
      login,
      logout,
      register,
      refreshProfile,
      request,
      requestVoid,
      selectCompany,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
