/*
  Warnings:

  - A unique constraint covering the columns `[botanicalName,userId]` on the table `Plant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Plant_botanicalName_key";

-- CreateIndex
CREATE UNIQUE INDEX "Plant_botanicalName_userId_key" ON "Plant"("botanicalName", "userId");
