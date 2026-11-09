import { CompanyRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeMembershipRoleDto {
  @IsEnum(CompanyRole)
  role!: CompanyRole;
}
