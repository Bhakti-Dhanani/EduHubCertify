import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET || "323efbde0be0f9af002ab6ff5654557fd5e98fbef3469e41fe2ab99ce8d5294c",
      { expiresIn: "10h" }
    );

    return NextResponse.json({ message: "Login successful", token, user }, { status: 200 });
  } catch (error) {
    if (error instanceof prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error during login:", error);
    } else {
      console.error("Login error:", error);
    }
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
