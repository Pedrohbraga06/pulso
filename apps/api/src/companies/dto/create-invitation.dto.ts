import { CompanyRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(CompanyRole)
  role: CompanyRole = CompanyRole.MEMBER;
}
