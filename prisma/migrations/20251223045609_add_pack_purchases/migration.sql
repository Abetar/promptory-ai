-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "PackPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "amountMx" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "mpPaymentId" TEXT,
    "note" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackPurchase_userId_idx" ON "PackPurchase"("userId");

-- CreateIndex
CREATE INDEX "PackPurchase_packId_idx" ON "PackPurchase"("packId");

-- CreateIndex
CREATE INDEX "PackPurchase_status_idx" ON "PackPurchase"("status");

-- CreateIndex
CREATE INDEX "PackPurchase_createdAt_idx" ON "PackPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "PackPurchase" ADD CONSTRAINT "PackPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPurchase" ADD CONSTRAINT "PackPurchase_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
