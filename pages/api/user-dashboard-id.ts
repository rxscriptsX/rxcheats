import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.dashboardId) return res.status(401).json({ error: "Unauthorized" });
  res.status(200).json({ dashboardId: token.dashboardId });
}
