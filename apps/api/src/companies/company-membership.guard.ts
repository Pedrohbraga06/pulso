import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyAuthenticatedRequest } from './company-access.types.js';

@Injectable()
export class CompanyMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<CompanyAuthenticatedRequest>();
    const userId = request.authUser?.userId;
    const companyId = request.params.companyId;

    if (!userId || typeof companyId !== 'string' || companyId.length === 0) {
      throw new NotFoundException('Company not found');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      select: {
        id: true,
        userId: true,
        companyId: true,
        role: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Company not found');
    }

    request.companyMembership = membership;
    return true;
  }
}
