"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const traits = [
    { name: "Flowering", slug: "flowering", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Fragrant", slug: "fragrant", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Long Blooming", slug: "long-blooming", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Pollinator-Friendly", slug: "pollinator-friendly", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Perennial", slug: "perennial", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Annual", slug: "annual", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Evergreen", slug: "evergreen", category: client_1.TraitCategory.BLOOMING_LIFECYCLE },
    { name: "Tropical", slug: "tropical", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Shade-Tolerant", slug: "shade-tolerant", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Full Sun", slug: "full-sun", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Drought-Tolerant", slug: "drought-tolerant", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Frost-Tolerant", slug: "frost-tolerant", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Climbing", slug: "climbing", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Groundcover", slug: "groundcover", category: client_1.TraitCategory.ENVIRONMENT_GROWTH },
    { name: "Fast-Growing", slug: "fast-growing", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Edible", slug: "edible", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Medicinal", slug: "medicinal", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Ornamental", slug: "ornamental", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Indoor-Friendly", slug: "indoor-friendly", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Native", slug: "native", category: client_1.TraitCategory.USE_ORIGIN },
    { name: "Invasive", slug: "invasive", category: client_1.TraitCategory.USE_ORIGIN },
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
