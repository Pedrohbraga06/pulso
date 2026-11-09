import { createContext } from 'react';
import type {
  AuthSessionResponse,
  CompanyMembershipProfile,
} from '@pulso/contracts';
import type { ApiRequestOptions } from '../services/api';

export interface AuthContextValue {
  session: AuthSessionResponse | null;
  activeCompanyId: string | null;
  memberships: CompanyMembershipProfile[];
  isAuthenticated: boolean;
  login(input: { email: string; password: string }): Promise<void>;
  register(input: { email: string; password: string; name: string; companyName: string }): Promise<void>;
  refreshProfile(): Promise<void>;
  logout(): void;
  selectCompany(companyId: string): void;
  request<T>(path: string, options?: Omit<ApiRequestOptions, 'token'>): Promise<T>;
  requestVoid(path: string, options?: Omit<ApiRequestOptions, 'token'>): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
