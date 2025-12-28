-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'pending',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountMx" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'pending',
    "mpPaymentId" TEXT,
    "note" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");

-- CreateIndex
CREATE INDEX "UserSubscription_endsAt_idx" ON "UserSubscription"("endsAt");

-- CreateIndex
CREATE INDEX "SubscriptionPurchase_userId_idx" ON "SubscriptionPurchase"("userId");

-- CreateIndex
CREATE INDEX "SubscriptionPurchase_status_idx" ON "SubscriptionPurchase"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPurchase_createdAt_idx" ON "SubscriptionPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPurchase" ADD CONSTRAINT "SubscriptionPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
