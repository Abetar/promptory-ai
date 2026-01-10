-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('basic', 'unlimited');

-- AlterTable
ALTER TABLE "SubscriptionPurchase" ADD COLUMN     "tier" "SubscriptionTier" NOT NULL DEFAULT 'basic';

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "tier" "SubscriptionTier" NOT NULL DEFAULT 'basic';

-- CreateIndex
CREATE INDEX "SubscriptionPurchase_tier_idx" ON "SubscriptionPurchase"("tier");

-- CreateIndex
CREATE INDEX "UserSubscription_tier_idx" ON "UserSubscription"("tier");
