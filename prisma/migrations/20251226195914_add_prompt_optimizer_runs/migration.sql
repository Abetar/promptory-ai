-- CreateEnum
CREATE TYPE "ToolTargetAI" AS ENUM ('chatgpt', 'claude', 'gemini', 'deepseek');

-- CreateTable
CREATE TABLE "PromptOptimizerRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetAI" "ToolTargetAI" NOT NULL DEFAULT 'chatgpt',
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptOptimizerRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptOptimizerRun_userId_idx" ON "PromptOptimizerRun"("userId");

-- CreateIndex
CREATE INDEX "PromptOptimizerRun_createdAt_idx" ON "PromptOptimizerRun"("createdAt");

-- AddForeignKey
ALTER TABLE "PromptOptimizerRun" ADD CONSTRAINT "PromptOptimizerRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
