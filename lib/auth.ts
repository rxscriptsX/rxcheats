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
        // Guardar el ID numérico de GitHub
        token.githubId = (profile as any).id?.toString();
      }
      if (token.githubId) {
        // Asignar dashboard ID de 6 dígitos
        let dashboardId = await kv.get<string>(`user:${token.githubId}:dashboardId`);
        if (!dashboardId) {
          dashboardId = Math.floor(100000 + Math.random() * 900000).toString();
          await kv.set(`user:${token.githubId}:dashboardId`, dashboardId);
        }
        token.dashboardId = dashboardId;
        token.sub = token.githubId; // Necesario para que session.user.id funcione
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.githubId as string;
        session.user.dashboardId = token.dashboardId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
