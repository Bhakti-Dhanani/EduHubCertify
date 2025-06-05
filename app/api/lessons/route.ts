import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany();
    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lesson = await prisma.lesson.create({ data: body });
    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.lesson.delete({ where: { id } });
    return NextResponse.json({ message: "Lesson deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
