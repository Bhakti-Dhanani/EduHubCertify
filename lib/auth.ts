import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import jwt from "jsonwebtoken";
import prisma from "./prisma";
import bcrypt from "bcrypt";

interface User {
  id: number; // Changed id type to number
  role: string;
  name: string;
  email: string;
}

// Create a slice for user authentication
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as User | null,
  },
  reducers: {
    setUser(state, action: { payload: User }) {
      state.user = action.payload;
    },
    clearUser(state) {
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

async function getUserFromToken(token: string) {
  try {
    const decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "default_secret") as { id: string };
    const user = await prisma.user.findUnique({ where: { id: Number(decodedToken.id) } });

    if (!user) {
      throw new Error("User not found");
    }

    // Update Redux store with user details
    store.dispatch(setUser({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    }));

    return user;
  } catch (error) {
    console.error("Error fetching user from token:", error);
    throw new Error("Invalid token");
  }
}

export const { handlers, auth } = NextAuth({
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

        // Update Redux store with user details
        store.dispatch(setUser({
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
        }));

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id.toString();
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const user = await getUserFromToken(token.id);
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.name = user.name;
      session.user.email = user.email;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
