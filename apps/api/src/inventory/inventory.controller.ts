import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type {
  InventoryItemResponse,
  InventoryMovementResponse,
} from '@pulso/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CompanyMembershipGuard } from '../companies/company-membership.guard.js';
import type { CompanyMembershipContext } from '../companies/company-access.types.js';
import { CurrentCompanyMembership } from '../companies/company-membership.decorator.js';
import { CompanyRoles } from '../companies/company-roles.decorator.js';
import { CompanyRolesGuard } from '../companies/company-roles.guard.js';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';
import { InventoryService } from './inventory.service.js';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@Controller('companies/:companyId/inventory-items')
@UseGuards(JwtAuthGuard, CompanyMembershipGuard)
export class InventoryItemsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  list(
    @Param('companyId') companyId: string,
  ): Promise<InventoryItemResponse[]> {
    return this.inventoryService.listItems(companyId);
  }

  @Post()
  @CompanyRoles('OWNER', 'ADMIN')
  @UseGuards(CompanyRolesGuard)
  create(
    @Param('companyId') companyId: string,
    @Body() input: CreateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    return this.inventoryService.createItem(companyId, input);
  }

  @Patch(':itemId')
  @CompanyRoles('OWNER', 'ADMIN')
  @UseGuards(CompanyRolesGuard)
  update(
    @Param('companyId') companyId: string,
    @Param('itemId') itemId: string,
    @Body() input: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    return this.inventoryService.updateItem(companyId, itemId, input);
  }

  @Post(':itemId/movements')
  createMovement(
    @Param('companyId') companyId: string,
    @Param('itemId') itemId: string,
    @CurrentCompanyMembership() actor: CompanyMembershipContext,
    @Body() input: CreateInventoryMovementDto,
  ): Promise<InventoryMovementResponse> {
    return this.inventoryService.createMovement(
      companyId,
      itemId,
      actor,
      input,
    );
  }
}

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@Controller('companies/:companyId/inventory-movements')
@UseGuards(JwtAuthGuard, CompanyMembershipGuard)
export class InventoryMovementsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  list(
    @Param('companyId') companyId: string,
  ): Promise<InventoryMovementResponse[]> {
    return this.inventoryService.listMovements(companyId);
  }
}
