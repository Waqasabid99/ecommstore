/*
  Warnings:

  - You are about to alter the column `minOrder` on the `ShippingRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `maxOrder` on the `ShippingRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `updatedAt` to the `ShippingRate` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `ShippingRate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'EXPRESS');

-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "taxAmount" SET DEFAULT 0,
ALTER COLUMN "taxRate" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "originalPrice" DECIMAL(65,30),
ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "ShippingRate" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PKR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" "ShippingMethod" NOT NULL,
ALTER COLUMN "minOrder" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "maxOrder" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingRate_country_state_method_idx" ON "ShippingRate"("country", "state", "method");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
