import prisma from "../lib/prisma";

async function testConnection() {
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
