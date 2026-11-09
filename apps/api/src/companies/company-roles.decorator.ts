import { SetMetadata } from '@nestjs/common';
import type { CompanyRole } from '@prisma/client';

export const COMPANY_ROLES_KEY = 'company-roles';

export const CompanyRoles = (...roles: CompanyRole[]) =>
  SetMetadata(COMPANY_ROLES_KEY, roles);
