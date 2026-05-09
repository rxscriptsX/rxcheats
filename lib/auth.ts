import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { kv } from "@vercel/kv";

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = (profile as any).id?.toString(); // GitHub ID
      }
      if (token.id) {
        let dashboardId = await kv.get<string>(`user:${token.id}:dashboardId`);
        if (!dashboardId) {
          dashboardId = Math.floor(100000 + Math.random() * 900000).toString();
          await kv.set(`user:${token.id}:dashboardId`, dashboardId);
        }
        token.dashboardId = dashboardId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.dashboardId = token.dashboardId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
