import { InventoryMovementType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  DECIMAL_QUANTITY_PATTERN,
  POSITIVE_QUANTITY_PATTERN,
} from './quantity-validation.js';

export class CreateInventoryMovementDto {
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @ValidateIf(
    (input: CreateInventoryMovementDto) =>
      input.type === InventoryMovementType.ENTRY ||
      input.type === InventoryMovementType.EXIT,
  )
  @IsString()
  @Matches(POSITIVE_QUANTITY_PATTERN)
  quantity?: string;

  @ValidateIf(
    (input: CreateInventoryMovementDto) =>
      input.type === InventoryMovementType.ADJUSTMENT,
  )
  @IsString()
  @Matches(DECIMAL_QUANTITY_PATTERN)
  countedQuantity?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  reason!: string;
}
