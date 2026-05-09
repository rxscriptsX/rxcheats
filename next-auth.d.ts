import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      dashboardId?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dashboardId?: string;
  }
}
