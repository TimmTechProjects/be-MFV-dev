"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
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
