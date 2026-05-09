import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./firebase-admin";

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account && token.sub) {
        // Asignar dashboard ID de 6 dígitos si no existe
        const userRef = db.ref(`users/${token.sub}`);
        const snapshot = await userRef.child("dashboardId").once("value");
        let dashboardId = snapshot.val();
        if (!dashboardId) {
          dashboardId = Math.floor(100000 + Math.random() * 900000).toString();
          await userRef.set({ dashboardId, githubId: token.sub });
        }
        token.dashboardId = dashboardId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
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
