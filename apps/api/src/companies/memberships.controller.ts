import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CompanyMemberDetails } from '@pulso/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { ChangeMembershipRoleDto } from './dto/change-membership-role.dto.js';
import type { CompanyMembershipContext } from './company-access.types.js';
import { CompanyMembershipGuard } from './company-membership.guard.js';
import { CurrentCompanyMembership } from './company-membership.decorator.js';
import { CompanyRoles } from './company-roles.decorator.js';
import { CompanyRolesGuard } from './company-roles.guard.js';
import { MembershipsService } from './memberships.service.js';

@ApiTags('memberships')
@ApiBearerAuth('access-token')
@Controller('companies/:companyId/members')
@UseGuards(JwtAuthGuard, CompanyMembershipGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  listMembers(
    @Param('companyId') companyId: string,
  ): Promise<CompanyMemberDetails[]> {
    return this.membershipsService.listMembers(companyId);
  }

  @Get(':membershipId')
  getMember(
    @Param('companyId') companyId: string,
    @Param('membershipId') membershipId: string,
  ): Promise<CompanyMemberDetails> {
    return this.membershipsService.getMember(companyId, membershipId);
  }

  @Post()
  @CompanyRoles('OWNER', 'ADMIN')
  @UseGuards(CompanyRolesGuard)
  addMember(
    @Param('companyId') companyId: string,
    @CurrentCompanyMembership() actor: CompanyMembershipContext,
    @Body() input: AddMemberDto,
  ): Promise<CompanyMemberDetails> {
    return this.membershipsService.addMember(companyId, actor, input);
  }

  @Delete(':membershipId')
  @CompanyRoles('OWNER', 'ADMIN')
  @UseGuards(CompanyRolesGuard)
  async removeMember(
    @Param('companyId') companyId: string,
    @Param('membershipId') membershipId: string,
    @CurrentCompanyMembership() actor: CompanyMembershipContext,
  ): Promise<void> {
    await this.membershipsService.removeMember(companyId, membershipId, actor);
  }

  @Patch(':membershipId/role')
  @CompanyRoles('OWNER', 'ADMIN')
  @UseGuards(CompanyRolesGuard)
  changeRole(
    @Param('companyId') companyId: string,
    @Param('membershipId') membershipId: string,
    @CurrentCompanyMembership() actor: CompanyMembershipContext,
    @Body() input: ChangeMembershipRoleDto,
  ): Promise<CompanyMemberDetails> {
    return this.membershipsService.changeRole(
      companyId,
      membershipId,
      actor,
      input,
    );
  }
}
