-- CreateEnum
CREATE TYPE "SubscriptionChangeType" AS ENUM ('cancel', 'downgrade');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "SubscriptionChangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "type" "SubscriptionChangeType" NOT NULL,
    "fromTier" "SubscriptionTier",
    "toTier" "SubscriptionTier",
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionChangeRequest_userId_createdAt_idx" ON "SubscriptionChangeRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionChangeRequest_status_createdAt_idx" ON "SubscriptionChangeRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionChangeRequest_type_createdAt_idx" ON "SubscriptionChangeRequest"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "SubscriptionChangeRequest" ADD CONSTRAINT "SubscriptionChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
