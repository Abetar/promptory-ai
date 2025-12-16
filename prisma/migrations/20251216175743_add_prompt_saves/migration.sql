-- DropIndex
DROP INDEX "Prompt_title_key";

-- CreateTable
CREATE TABLE "PromptSave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptSave_userId_idx" ON "PromptSave"("userId");

-- CreateIndex
CREATE INDEX "PromptSave_promptId_idx" ON "PromptSave"("promptId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptSave_userId_promptId_key" ON "PromptSave"("userId", "promptId");

-- AddForeignKey
ALTER TABLE "PromptSave" ADD CONSTRAINT "PromptSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptSave" ADD CONSTRAINT "PromptSave_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
