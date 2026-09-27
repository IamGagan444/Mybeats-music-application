import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      audiusUserId: string | null;
      audiusHandle: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    audiusUserId?: string | null;
    audiusHandle?: string | null;
  }
}
