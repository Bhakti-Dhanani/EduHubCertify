import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        const { email, password } = credentials;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        ...session.user, // Preserve existing fields like name, email, image
        id: token.id as string, // Ensure `id` is included in the session
        role: token.role as string, // Ensure `role` is included in the session
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Ensure `id` is included in the token
        token.role = user.role; // Ensure `role` is included in the token
      }
      return token;
    },
  },
};

export const GET = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
export const POST = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
