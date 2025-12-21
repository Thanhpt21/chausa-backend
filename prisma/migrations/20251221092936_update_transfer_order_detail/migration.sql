/*
  Warnings:

  - Added the required column `unitPrice` to the `TransferOrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransferOrderDetail" ADD COLUMN     "finalPrice" DOUBLE PRECISION,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
