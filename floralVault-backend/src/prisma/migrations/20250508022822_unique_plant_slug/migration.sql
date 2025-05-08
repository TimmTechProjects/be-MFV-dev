/*
  Warnings:

  - A unique constraint covering the columns `[slug,userId]` on the table `Plant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `collectionId` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Plant_botanicalName_userId_key";

-- DropIndex
DROP INDEX "Plant_slug_key";

-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "collectionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plant_slug_userId_key" ON "Plant"("slug", "userId");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
