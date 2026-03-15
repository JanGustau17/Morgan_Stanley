import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe auth config (no Supabase/Node-only code).
 * Used by middleware; full config with callbacks is in lib/auth.ts.
 */
export default {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
} satisfies NextAuthConfig;
