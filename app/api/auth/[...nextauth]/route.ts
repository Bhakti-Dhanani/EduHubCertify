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
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// Create a slice for user authentication
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
  },
  reducers: {
    setUser(state: { user: any }, action: { payload: any }) {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Use roles as stored in the database
      }
      return token;
    },
    async session({ session, token }) {
      // Use Redux Toolkit storage instead of session
      store.dispatch(setUser({
        id: token.id,
        role: token.role, // Use roles as stored in the database
        name: session.user?.name,
        email: session.user?.email,
      }));
      return session;
    },
  },
};

export const GET = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
export const POST = (req: NextApiRequest, res: NextApiResponse) => NextAuth(authOptions)(req, res);
