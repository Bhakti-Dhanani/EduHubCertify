import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const modules = await prisma.module.findMany();
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const module = await prisma.module.create({ data: body });
    return NextResponse.json(module);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ message: "Module deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
