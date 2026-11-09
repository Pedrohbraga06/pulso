import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
  AcceptInvitationController,
  CompanyInvitationsController,
} from './invitations.controller.js';
import { CompanyMembershipGuard } from './company-membership.guard.js';
import { CompanyRolesGuard } from './company-roles.guard.js';
import { CompaniesController } from './companies.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MembershipsController } from './memberships.controller.js';
import { MembershipsService } from './memberships.service.js';

@Module({
  imports: [AuthModule],
  controllers: [
    CompaniesController,
    MembershipsController,
    CompanyInvitationsController,
    AcceptInvitationController,
  ],
  providers: [
    MembershipsService,
    InvitationsService,
    JwtAuthGuard,
    CompanyMembershipGuard,
    CompanyRolesGuard,
  ],
})
export class CompaniesModule {}
