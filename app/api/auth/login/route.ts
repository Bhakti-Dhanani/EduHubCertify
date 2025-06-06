import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

export async function POST(request: Request) {
  const session = await auth({ req: request });

  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ message: "Login successful", user: session.user }, { status: 200 });
}
