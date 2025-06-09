import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Initializing Prisma Client...");

export default prisma;

prisma.progress.findFirst;
prisma.progress.upsert;

console.log("Available Prisma models:", Object.keys(prisma));
