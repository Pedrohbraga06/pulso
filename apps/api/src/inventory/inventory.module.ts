import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CompanyMembershipGuard } from '../companies/company-membership.guard.js';
import { CompanyRolesGuard } from '../companies/company-roles.guard.js';
import {
  InventoryItemsController,
  InventoryMovementsController,
} from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [InventoryItemsController, InventoryMovementsController],
  providers: [
    InventoryService,
    CompanyMembershipGuard,
    CompanyRolesGuard,
  ],
})
export class InventoryModule {}
