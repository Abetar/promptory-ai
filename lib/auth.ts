import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    async session({ session, user }) {
      // ✅ Inyecta el user.id en session.user
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      // ✅ Audit log: login exitoso
      await logEvent({
        userId: user?.id ?? null,
        email: user?.email ?? null,
        event: "auth.login",
        meta: {
          provider: "google",
        },
      });
    },
  },
};
