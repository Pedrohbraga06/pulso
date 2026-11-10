-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityOnHand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "minimumQuantity" DECIMAL(14,3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryItem_quantityOnHand_nonnegative" CHECK ("quantityOnHand" >= 0),
    CONSTRAINT "InventoryItem_minimumQuantity_nonnegative" CHECK ("minimumQuantity" >= 0)
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "countedQuantity" DECIMAL(14,3),
    "delta" DECIMAL(14,3) NOT NULL,
    "beforeQuantity" DECIMAL(14,3) NOT NULL,
    "afterQuantity" DECIMAL(14,3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryMovement_quantity_nonnegative" CHECK ("quantity" >= 0),
    CONSTRAINT "InventoryMovement_balances_nonnegative" CHECK ("beforeQuantity" >= 0 AND "afterQuantity" >= 0),
    CONSTRAINT "InventoryMovement_balance_consistent" CHECK ("afterQuantity" = "beforeQuantity" + "delta"),
    CONSTRAINT "InventoryMovement_type_consistent" CHECK (
        ("type" = 'ENTRY' AND "quantity" > 0 AND "countedQuantity" IS NULL AND "delta" = "quantity") OR
        ("type" = 'EXIT' AND "quantity" > 0 AND "countedQuantity" IS NULL AND "delta" = -"quantity") OR
        ("type" = 'ADJUSTMENT' AND "countedQuantity" IS NOT NULL AND "quantity" = ABS("delta") AND "delta" = "countedQuantity" - "beforeQuantity" AND "afterQuantity" = "countedQuantity")
    )
);

-- CreateIndex
CREATE INDEX "InventoryItem_companyId_isActive_name_idx" ON "InventoryItem"("companyId", "isActive", "name");

-- CreateIndex
CREATE INDEX "InventoryMovement_itemId_createdAt_idx" ON "InventoryMovement"("itemId", "createdAt");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
