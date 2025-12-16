/*
  Warnings:

  - You are about to drop the `PromptSave` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PromptSave" DROP CONSTRAINT "PromptSave_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptSave" DROP CONSTRAINT "PromptSave_userId_fkey";

-- DropTable
DROP TABLE "PromptSave";

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_title_key" ON "Prompt"("title");
