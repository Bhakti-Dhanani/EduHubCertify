import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, DefaultSession } from "next-auth";
import { configureStore, createSlice } from "@reduxjs/toolkit";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Changed id type to number
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: number; // Changed id type to number
    role: string;
  }
}

// Create a slice for user authentication
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
  },
  reducers: {
    setUser(state: { user: any }, action: { payload: { id: number; role: string; name: string; email: string } }) {
      state.user = action.payload;
    },
    clearUser(state: { user: any }) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

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

        if (!user || !(await bcrypt.compare(password, user.password))) {
          throw new Error("Invalid email or password");
        }

        return {
          id: Number(user.id), // Ensure id is treated as a number
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id.toString(); // Convert user.id to string
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = Number(token.id); // Ensure id is treated as a number
      session.user.role = token.role;
      return session;
    },
  },
};

export const GET = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
export const POST = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
