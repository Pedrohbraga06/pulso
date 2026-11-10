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

export type InventoryMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";

export type InventoryItemStatus =
  | "HEALTHY"
  | "AT_MINIMUM"
  | "BELOW_MINIMUM";

export interface InventoryItemResponse {
  id: string;
  companyId: string;
  name: string;
  unit: string;
  quantityOnHand: string;
  minimumQuantity: string;
  status: InventoryItemStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovementResponse {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  actorUserId: string;
  actorName: string;
  type: InventoryMovementType;
  quantity: string;
  countedQuantity: string | null;
  delta: string;
  beforeQuantity: string;
  afterQuantity: string;
  reason: string;
  createdAt: string;
}

export interface CreateInventoryItemInput {
  name: string;
  unit: string;
  minimumQuantity: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  minimumQuantity?: string;
  isActive?: boolean;
}

export type CreateInventoryMovementInput =
  | {
      type: "ENTRY" | "EXIT";
      quantity: string;
      reason: string;
    }
  | {
      type: "ADJUSTMENT";
      countedQuantity: string;
      reason: string;
    };
