const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      console.log("Test user already exists:", existingUser.id);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("Password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      },
    });

    console.log("Test user created successfully:", user);
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 