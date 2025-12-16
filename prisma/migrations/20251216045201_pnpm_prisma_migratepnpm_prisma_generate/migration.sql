-- CreateTable
CREATE TABLE "AiTool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptAiTool" (
    "promptId" TEXT NOT NULL,
    "aiToolId" TEXT NOT NULL,

    CONSTRAINT "PromptAiTool_pkey" PRIMARY KEY ("promptId","aiToolId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiTool_slug_key" ON "AiTool"("slug");

-- CreateIndex
CREATE INDEX "PromptAiTool_aiToolId_idx" ON "PromptAiTool"("aiToolId");

-- CreateIndex
CREATE INDEX "PromptAiTool_promptId_idx" ON "PromptAiTool"("promptId");

-- AddForeignKey
ALTER TABLE "PromptAiTool" ADD CONSTRAINT "PromptAiTool_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptAiTool" ADD CONSTRAINT "PromptAiTool_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AiTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
