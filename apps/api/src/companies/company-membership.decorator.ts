import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CompanyAuthenticatedRequest } from './company-access.types.js';

export const CurrentCompanyMembership = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<CompanyAuthenticatedRequest>()
      .companyMembership,
);
