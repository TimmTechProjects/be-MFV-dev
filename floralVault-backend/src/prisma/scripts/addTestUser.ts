import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const testEmail = "test@floralvault.dev";
  const testUsername = "test";
  const testPassword = "TestPassword123!";

  console.log(`🔍 Checking for existing test user: ${testEmail}`);

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (user) {
    console.log(`✅ Test user found. Updating password...`);
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    user = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    console.log(`✅ Password updated for user: ${user.username}`);
  } else {
    console.log(`❌ Test user not found. Creating new user...`);
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    user = await prisma.user.create({
      data: {
        username: testUsername,
        email: testEmail,
        firstName: "Test",
        lastName: "User",
        password: hashedPassword,
        bio: "Test account for QA and preview testing",
        joinedAt: new Date(),
      },
    });
    console.log(`✅ Test user created successfully!`);
  }

  console.log(`\n📝 Test Account Details:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
