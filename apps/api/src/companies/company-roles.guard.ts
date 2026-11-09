import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { CompanyRole } from '@prisma/client';
import { COMPANY_ROLES_KEY } from './company-roles.decorator.js';
import type { CompanyAuthenticatedRequest } from './company-access.types.js';

@Injectable()
export class CompanyRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(
      COMPANY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<CompanyAuthenticatedRequest>();
    if (
      !request.companyMembership ||
      !requiredRoles.includes(request.companyMembership.role)
    ) {
      throw new ForbiddenException('Insufficient company role');
    }

    return true;
  }
}
