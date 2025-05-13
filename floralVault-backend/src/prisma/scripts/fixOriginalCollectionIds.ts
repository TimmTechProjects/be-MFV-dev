import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const plants = await prisma.plant.findMany({
    where: { originalCollectionId: null },
    select: { id: true, collectionId: true },
  });

  console.log(`🔍 Found ${plants.length} plants missing originalCollectionId`);

  for (const plant of plants) {
    await prisma.plant.update({
      where: { id: plant.id },
      data: { originalCollectionId: plant.collectionId },
    });
  }

  console.log("✅ originalCollectionId fields updated successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Failed to update plants:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
