import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

const secret = process.env.NEXTAUTH_SECRET!;

export async function getAuthToken(request: NextRequest) {
  try {
    // Extract the Bearer token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authentication Error: Missing or invalid Authorization header.");
    }

    const tokenString = authHeader.split(" ")[1];

    // Create a minimal mock object for `NextApiRequest`
    const adaptedRequest = {
      headers: {
        authorization: `Bearer ${tokenString}`,
      },
      cookies: {},
      query: {},
    } as unknown as NextApiRequest;

    const token = await getToken({
      req: adaptedRequest,
      secret,
    });

    if (!token) {
      throw new Error("Authentication Error: Token not found.");
    }

    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    throw new Error("Failed to retrieve authentication token.");
  }
}
