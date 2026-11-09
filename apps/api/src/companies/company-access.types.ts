import type { CompanyRole } from '@prisma/client';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.types.js';

export interface CompanyMembershipContext {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyRole;
}

export interface CompanyAuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
  companyMembership?: CompanyMembershipContext;
}
