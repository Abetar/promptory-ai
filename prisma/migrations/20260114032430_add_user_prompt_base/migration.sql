-- CreateTable
CREATE TABLE "UserPromptBase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPromptBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPromptBase_userId_key" ON "UserPromptBase"("userId");

-- CreateIndex
CREATE INDEX "UserPromptBase_userId_idx" ON "UserPromptBase"("userId");

-- AddForeignKey
ALTER TABLE "UserPromptBase" ADD CONSTRAINT "UserPromptBase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
