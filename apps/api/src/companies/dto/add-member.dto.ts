import { CompanyRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsUUID, ValidateIf } from 'class-validator';

export class AddMemberDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID()
  userId!: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(CompanyRole)
  role: CompanyRole = CompanyRole.MEMBER;
}
