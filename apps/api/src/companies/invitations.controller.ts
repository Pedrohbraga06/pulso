import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type {
  AcceptedCompanyInvitation,
  CompanyInvitationSummary,
  CreatedCompanyInvitation,
} from '@pulso/contracts';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import type { CompanyMembershipContext } from './company-access.types.js';
import { CompanyMembershipGuard } from './company-membership.guard.js';
import { CurrentCompanyMembership } from './company-membership.decorator.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { CompanyRoles } from './company-roles.decorator.js';
import { CompanyRolesGuard } from './company-roles.guard.js';
import { InvitationsService } from './invitations.service.js';

@ApiTags('invitations')
@ApiBearerAuth('access-token')
@Controller('companies/:companyId/invitations')
@UseGuards(JwtAuthGuard, CompanyMembershipGuard, CompanyRolesGuard)
@CompanyRoles('OWNER', 'ADMIN')
export class CompanyInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(
    @Param('companyId') companyId: string,
    @CurrentCompanyMembership() actor: CompanyMembershipContext,
    @Body() input: CreateInvitationDto,
  ): Promise<CreatedCompanyInvitation> {
    return this.invitationsService.create(companyId, actor, input);
  }

  @Get()
  list(
    @Param('companyId') companyId: string,
  ): Promise<CompanyInvitationSummary[]> {
    return this.invitationsService.list(companyId);
  }

  @Delete(':invitationId')
  revoke(
    @Param('companyId') companyId: string,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    return this.invitationsService.revoke(companyId, invitationId);
  }
}

@ApiTags('invitations')
@ApiBearerAuth('access-token')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class AcceptInvitationController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('accept')
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: AcceptInvitationDto,
  ): Promise<AcceptedCompanyInvitation> {
    return this.invitationsService.accept(user.userId, input);
  }
}
