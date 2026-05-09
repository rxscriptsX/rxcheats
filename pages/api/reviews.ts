import { db } from "../../lib/firebase-admin";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

interface Review {
  userId: string;
  productName: string;
  title: string;
  description: string;
  stars: number;
  createdAt: number;
}

const COOLDOWN_HOURS = 32;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const snapshot = await db.ref("reviews").once("value");
      const reviews = snapshot.val() ? Object.values(snapshot.val()) : [];
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

      // Cooldown de 32 horas
      const lastReviewRef = db.ref(`lastReview/${userId}`);
      const lastReviewSnap = await lastReviewRef.once("value");
      const lastReview = lastReviewSnap.val();
      if (lastReview) {
        const diff = Date.now() - lastReview;
        if (diff < COOLDOWN_HOURS * 3600 * 1000) {
          const remaining = Math.ceil((COOLDOWN_HOURS * 3600 * 1000 - diff) / 60000);
          return res.status(429).json({ error: `Debes esperar ${remaining} minutos para publicar otra reseña.` });
        }
      }

      const review: Review = {
        userId,
        productName,
        title,
        description,
        stars,
        createdAt: Date.now(),
      };

      await db.ref("reviews").push().set(review);
      await lastReviewRef.set(Date.now());

      return res.status(201).json(review);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
