-- CreateEnum
CREATE TYPE "AccessSource" AS ENUM ('manual', 'promo', 'payment', 'support', 'temp');

-- CreateTable
CREATE TABLE "UserPromptAccess" (
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "source" "AccessSource" NOT NULL DEFAULT 'manual',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPromptAccess_pkey" PRIMARY KEY ("userId","promptId")
);

-- CreateIndex
CREATE INDEX "UserPromptAccess_userId_idx" ON "UserPromptAccess"("userId");

-- CreateIndex
CREATE INDEX "UserPromptAccess_promptId_idx" ON "UserPromptAccess"("promptId");

-- CreateIndex
CREATE INDEX "UserPromptAccess_expiresAt_idx" ON "UserPromptAccess"("expiresAt");

-- AddForeignKey
ALTER TABLE "UserPromptAccess" ADD CONSTRAINT "UserPromptAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPromptAccess" ADD CONSTRAINT "UserPromptAccess_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
