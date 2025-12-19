-- CreateTable
CREATE TABLE "TransferOrderDetail" (
    "id" SERIAL NOT NULL,
    "transferId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "colorTitle" TEXT NOT NULL,
    "size" TEXT,
    "unit" TEXT DEFAULT 'cái',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferOrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransferOrderDetail_transferId_idx" ON "TransferOrderDetail"("transferId");

-- CreateIndex
CREATE INDEX "TransferOrderDetail_productId_idx" ON "TransferOrderDetail"("productId");

-- AddForeignKey
ALTER TABLE "TransferOrderDetail" ADD CONSTRAINT "TransferOrderDetail_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrderDetail" ADD CONSTRAINT "TransferOrderDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
