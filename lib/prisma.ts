import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Initializing Prisma Client...");

export default prisma;
