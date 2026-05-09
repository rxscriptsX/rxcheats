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
    async jwt({ token, account }) {
      // La primera vez que se autentica, token.sub ya tiene el ID de GitHub (string)
      if (account && token.sub) {
        // Buscar o crear el dashboard ID de 6 dígitos
        let dashboardId = await kv.get<string>(`user:${token.sub}:dashboardId`);
        if (!dashboardId) {
          dashboardId = Math.floor(100000 + Math.random() * 900000).toString();
          await kv.set(`user:${token.sub}:dashboardId`, dashboardId);
        }
        token.dashboardId = dashboardId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;         // GitHub ID
        session.user.dashboardId = token.dashboardId as string; // ID de 6 dígitos
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
