import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

/**  GET /api/courses  */
export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses." }, { status: 500 });
  }
}

/**  POST /api/courses  */
export async function POST(req: NextRequest) {
  try {
    const session = await auth({ req }); // Pass the request explicitly

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (session.user.role !== "Instructor" && session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, thumbnail } = await req.json();

    if (!title || !description || !thumbnail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        instructorId: session.user.id,
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: error.message || "Unexpected error." }, { status: 500 });
  }
}

/**  DELETE /api/courses  */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth(); // Use the App-router helper

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "Course deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: error.message || "Unexpected error." }, { status: 500 });
  }
}
