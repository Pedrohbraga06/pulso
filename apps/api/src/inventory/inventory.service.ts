import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CompanyRole,
  InventoryMovementType,
  Prisma,
} from '@prisma/client';
import type {
  InventoryItemResponse,
  InventoryMovementResponse,
} from '@pulso/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyMembershipContext } from '../companies/company-access.types.js';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';

type MovementWithDetails = Prisma.InventoryMovementGetPayload<{
  include: {
    item: { select: { name: true; unit: true } };
    actor: { select: { name: true } };
  };
}>;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listItems(companyId: string): Promise<InventoryItemResponse[]> {
    const items = await this.prisma.inventoryItem.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return items.map((item) => this.toItemResponse(item));
  }

  async createItem(
    companyId: string,
    input: CreateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    const item = await this.prisma.inventoryItem.create({
      data: {
        companyId,
        name: input.name,
        unit: input.unit,
        minimumQuantity: new Prisma.Decimal(input.minimumQuantity),
      },
    });

    return this.toItemResponse(item);
  }

  async updateItem(
    companyId: string,
    itemId: string,
    input: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    const data: Prisma.InventoryItemUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.minimumQuantity !== undefined) {
      data.minimumQuantity = new Prisma.Decimal(input.minimumQuantity);
    }
    if (input.isActive !== undefined) data.isActive = input.isActive;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Provide at least one item field to update');
    }

    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, companyId },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id: item.id },
      data,
    });

    return this.toItemResponse(updated);
  }

  async listMovements(
    companyId: string,
  ): Promise<InventoryMovementResponse[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { item: { companyId } },
      include: {
        item: { select: { name: true, unit: true } },
        actor: { select: { name: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return movements.map((movement) => this.toMovementResponse(movement));
  }

  async createMovement(
    companyId: string,
    itemId: string,
    actor: CompanyMembershipContext,
    input: CreateInventoryMovementDto,
  ): Promise<InventoryMovementResponse> {
    if (
      input.type === InventoryMovementType.ADJUSTMENT &&
      actor.role !== CompanyRole.OWNER &&
      actor.role !== CompanyRole.ADMIN
    ) {
      throw new ForbiddenException('Only an OWNER or ADMIN can adjust stock');
    }

    if (
      input.type === InventoryMovementType.ADJUSTMENT
        ? input.countedQuantity === undefined || input.quantity !== undefined
        : input.quantity === undefined || input.countedQuantity !== undefined
    ) {
      throw new BadRequestException(
        'Provide the quantity field required by the movement type',
      );
    }

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const item = await transaction.inventoryItem.findFirst({
            where: { id: itemId, companyId },
          });
          if (!item) {
            throw new NotFoundException('Inventory item not found');
          }
          if (!item.isActive) {
            throw new ConflictException(
              'Archived inventory items cannot receive movements',
            );
          }

          const beforeQuantity = item.quantityOnHand;
          let quantity: Prisma.Decimal;
          let countedQuantity: Prisma.Decimal | null = null;
          let delta: Prisma.Decimal;
          let afterQuantity: Prisma.Decimal;

          if (input.type === InventoryMovementType.ENTRY) {
            quantity = new Prisma.Decimal(input.quantity!);
            delta = quantity;
            afterQuantity = beforeQuantity.add(delta);
          } else if (input.type === InventoryMovementType.EXIT) {
            quantity = new Prisma.Decimal(input.quantity!);
            delta = quantity.negated();
            afterQuantity = beforeQuantity.add(delta);
            if (afterQuantity.lessThan(0)) {
              throw new ConflictException('Insufficient stock');
            }
          } else {
            countedQuantity = new Prisma.Decimal(input.countedQuantity!);
            delta = countedQuantity.minus(beforeQuantity);
            quantity = delta.abs();
            afterQuantity = countedQuantity;
          }

          await transaction.inventoryItem.update({
            where: { id: item.id },
            data: { quantityOnHand: afterQuantity },
          });

          const movement = await transaction.inventoryMovement.create({
            data: {
              itemId: item.id,
              actorUserId: actor.userId,
              type: input.type,
              quantity,
              countedQuantity,
              delta,
              beforeQuantity,
              afterQuantity,
              reason: input.reason,
            },
            include: {
              item: { select: { name: true, unit: true } },
              actor: { select: { name: true } },
            },
          });

          return this.toMovementResponse(movement);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Concurrent stock update; retry the operation',
        );
      }

      throw error;
    }
  }

  private toItemResponse(
    item: Prisma.InventoryItemGetPayload<Record<string, never>>,
  ): InventoryItemResponse {
    let status: InventoryItemResponse['status'] = 'HEALTHY';
    if (item.quantityOnHand.lessThan(item.minimumQuantity)) {
      status = 'BELOW_MINIMUM';
    } else if (item.quantityOnHand.equals(item.minimumQuantity)) {
      status = 'AT_MINIMUM';
    }

    return {
      id: item.id,
      companyId: item.companyId,
      name: item.name,
      unit: item.unit,
      quantityOnHand: item.quantityOnHand.toString(),
      minimumQuantity: item.minimumQuantity.toString(),
      status,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private toMovementResponse(
    movement: MovementWithDetails,
  ): InventoryMovementResponse {
    return {
      id: movement.id,
      itemId: movement.itemId,
      itemName: movement.item.name,
      unit: movement.item.unit,
      actorUserId: movement.actorUserId,
      actorName: movement.actor.name,
      type: movement.type,
      quantity: movement.quantity.toString(),
      countedQuantity: movement.countedQuantity?.toString() ?? null,
      delta: movement.delta.toString(),
      beforeQuantity: movement.beforeQuantity.toString(),
      afterQuantity: movement.afterQuantity.toString(),
      reason: movement.reason,
      createdAt: movement.createdAt.toISOString(),
    };
  }
}
