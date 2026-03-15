import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    volunteerId?: string;
    role?: string;
  }

  interface Session {
    user: {
      volunteerId?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    volunteerId?: string;
    role?: string;
  }
}
