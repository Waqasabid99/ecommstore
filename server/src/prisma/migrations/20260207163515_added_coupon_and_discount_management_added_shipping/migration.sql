/*
  Warnings:

  - You are about to drop the column `discountPct` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `subtotal` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(10,2),
ADD COLUMN     "discountPct" INTEGER,
ADD COLUMN     "shippingAmount" DECIMAL(10,2),
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxAmount" DECIMAL(10,2),
ADD COLUMN     "taxRate" DECIMAL(5,2),
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountPct",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discountType" TEXT NOT NULL DEFAULT 'PERCENT',
ADD COLUMN     "discountValue" INTEGER NOT NULL,
ADD COLUMN     "minCartTotal" DECIMAL(10,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalAmount",
ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(10,2),
ADD COLUMN     "discountPct" INTEGER,
ADD COLUMN     "shippingAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "shippingMethod" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxRate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "tag" TEXT[];

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "method" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "minOrder" DECIMAL(65,30),
    "maxOrder" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
