-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "originalCollectionId" TEXT;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_originalCollectionId_fkey" FOREIGN KEY ("originalCollectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
