-- CreateEnum
CREATE TYPE "OptimizerPlan" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "OptimizerEngine" AS ENUM ('mock', 'openai');

-- AlterTable
ALTER TABLE "PromptOptimizerRun" ADD COLUMN     "engine" "OptimizerEngine" NOT NULL DEFAULT 'mock',
ADD COLUMN     "model" TEXT,
ADD COLUMN     "plan" "OptimizerPlan" NOT NULL DEFAULT 'free';

-- CreateIndex
CREATE INDEX "PromptOptimizerRun_plan_idx" ON "PromptOptimizerRun"("plan");

-- CreateIndex
CREATE INDEX "PromptOptimizerRun_engine_idx" ON "PromptOptimizerRun"("engine");
