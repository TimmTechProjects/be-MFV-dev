/*
  Warnings:

  - A unique constraint covering the columns `[botanicalName]` on the table `Plant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- CreateIndex
CREATE UNIQUE INDEX "Plant_botanicalName_key" ON "Plant"("botanicalName");
