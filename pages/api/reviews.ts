import { kv } from "@vercel/kv";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

interface Review {
  id: string;
  userId: string;
  productName: string;
  title: string;
  description: string;
  stars: number;
  createdAt: number;
}

const COOLDOWN = 32 * 3600 * 1000; // 32 horas en milisegundos

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = "reviews";

  if (req.method === "GET") {
    const reviews = await kv.get<Review[]>(key) || [];
    return res.status(200).json(reviews);
  }

  if (req.method === "POST") {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return res.status(401).json({ error: "No autorizado" });

    const userId = token.sub;
    const { productName, title, description, stars } = req.body;
    if (!productName || !title || !description || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Verificar cooldown
    const lastReviewKey = `lastReview:${userId}`;
    const lastReview = await kv.get<number>(lastReviewKey);
    if (lastReview && Date.now() - lastReview < COOLDOWN) {
      const remaining = Math.ceil((lastReview + COOLDOWN - Date.now()) / 60000);
      return res.status(429).json({ error: `Debes esperar ${remaining} minutos para publicar otra reseña.` });
    }

    const reviews = await kv.get<Review[]>(key) || [];
    const newReview: Review = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      userId,
      productName,
      title,
      description,
      stars,
      createdAt: Date.now(),
    };
    reviews.push(newReview);
    await kv.set(key, reviews);
    await kv.set(lastReviewKey, Date.now());
    return res.status(201).json(newReview);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
