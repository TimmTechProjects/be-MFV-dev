-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "thumbnailImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_thumbnailImageId_fkey" FOREIGN KEY ("thumbnailImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
