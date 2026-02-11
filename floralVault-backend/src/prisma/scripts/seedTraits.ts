import { PrismaClient, TraitCategory } from "@prisma/client";

const prisma = new PrismaClient();

const traits = [
  { name: "Flowering", slug: "flowering", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Fragrant", slug: "fragrant", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Long Blooming", slug: "long-blooming", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Pollinator-Friendly", slug: "pollinator-friendly", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Perennial", slug: "perennial", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Annual", slug: "annual", category: TraitCategory.BLOOMING_LIFECYCLE },
  { name: "Evergreen", slug: "evergreen", category: TraitCategory.BLOOMING_LIFECYCLE },

  { name: "Tropical", slug: "tropical", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Shade-Tolerant", slug: "shade-tolerant", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Full Sun", slug: "full-sun", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Drought-Tolerant", slug: "drought-tolerant", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Frost-Tolerant", slug: "frost-tolerant", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Climbing", slug: "climbing", category: TraitCategory.ENVIRONMENT_GROWTH },
  { name: "Groundcover", slug: "groundcover", category: TraitCategory.ENVIRONMENT_GROWTH },

  { name: "Fast-Growing", slug: "fast-growing", category: TraitCategory.USE_ORIGIN },
  { name: "Edible", slug: "edible", category: TraitCategory.USE_ORIGIN },
  { name: "Medicinal", slug: "medicinal", category: TraitCategory.USE_ORIGIN },
  { name: "Ornamental", slug: "ornamental", category: TraitCategory.USE_ORIGIN },
  { name: "Indoor-Friendly", slug: "indoor-friendly", category: TraitCategory.USE_ORIGIN },
  { name: "Native", slug: "native", category: TraitCategory.USE_ORIGIN },
  { name: "Invasive", slug: "invasive", category: TraitCategory.USE_ORIGIN },
];

async function main() {
  console.log("Seeding 21 traits...");

  for (const trait of traits) {
    await prisma.trait.upsert({
      where: { slug: trait.slug },
      update: { name: trait.name, category: trait.category },
      create: trait,
    });
  }

  const count = await prisma.trait.count();
  console.log(`Done! ${count} traits in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
