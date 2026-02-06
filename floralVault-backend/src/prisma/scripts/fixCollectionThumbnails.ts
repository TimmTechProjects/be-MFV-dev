import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

/**
 * One-time script to fix existing collections that have plants with images
 * but no thumbnail set. Sets the main image of the first plant as thumbnail.
 */
async function fixCollectionThumbnails() {
  console.log("🔧 Starting thumbnail fix for existing collections...");

  // Find all collections without thumbnails
  const collectionsWithoutThumbnails = await prisma.collection.findMany({
    where: { thumbnailImageId: null },
    include: {
      plants: {
        include: {
          images: { where: { isMain: true }, take: 1 },
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  console.log(`Found ${collectionsWithoutThumbnails.length} collections without thumbnails`);

  let fixed = 0;
  for (const collection of collectionsWithoutThumbnails) {
    const firstPlant = collection.plants[0];
    const mainImage = firstPlant?.images?.[0];

    if (mainImage) {
      await prisma.collection.update({
        where: { id: collection.id },
        data: { thumbnailImageId: mainImage.id },
      });
      console.log(`✅ Fixed: "${collection.name}" → ${mainImage.url.slice(0, 50)}...`);
      fixed++;
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixed} collections.`);
  process.exit(0);
}

fixCollectionThumbnails();
