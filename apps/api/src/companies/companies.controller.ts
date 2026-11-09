import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CompanyMembershipSummary } from '@pulso/contracts';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { MembershipsService } from './memberships.service.js';

@ApiTags('companies')
@ApiBearerAuth('access-token')
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  listMyCompanies(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CompanyMembershipSummary[]> {
    return this.membershipsService.listMyCompanies(user.userId);
  }
}
