/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
