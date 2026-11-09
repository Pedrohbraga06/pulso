export type HealthCheckStatus = "ok" | "error" | "degraded" | "shutting_down";

export interface HealthIndicatorResult {
  status: "up" | "down" | "degraded";
  [key: string]: unknown;
}

export interface HealthCheckResponse {
  status: HealthCheckStatus;
  info?: Partial<Record<string, HealthIndicatorResult>>;
  error?: Partial<Record<string, HealthIndicatorResult>>;
  details: Record<string, HealthIndicatorResult>;
}

export type CompanyRole = "OWNER" | "ADMIN" | "MEMBER";

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
}

export interface CompanyMembershipProfile {
  companyId: string;
  companyName: string;
  role: CompanyRole;
}

export interface AuthProfileResponse {
  user: AuthUserProfile;
  memberships: CompanyMembershipProfile[];
}

export interface AuthSessionResponse extends AuthProfileResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface CompanyMembershipSummary {
  id: string;
  companyId: string;
  companyName: string;
  role: CompanyRole;
  createdAt: string;
}

export interface CompanyMemberDetails {
  id: string;
  companyId: string;
  userId: string;
  email: string;
  name: string;
  role: CompanyRole;
  createdAt: string;
}

export interface CompanyInvitationSummary {
  id: string;
  companyId: string;
  email: string | null;
  role: CompanyRole;
  expiresAt: string;
  revokedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

export interface CreatedCompanyInvitation extends CompanyInvitationSummary {
  token: string;
}

export interface AcceptedCompanyInvitation {
  companyId: string;
  companyName: string;
  role: CompanyRole;
}
