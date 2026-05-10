import { db } from "../../lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

interface Coupon {
  code: string;
  discount: number;
}

interface Product {
  name: string;
  price: number;
  paymentLink: string;
  description: string;
  platform: string;
  coupons: Coupon[];
  createdAt: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const snapshot = await db.ref("products").once("value");
      const products = snapshot.val() ? Object.values(snapshot.val()) : [];
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const secret = req.headers["x-admin-secret"];
      if (secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const { name, price, paymentLink, description, platform, coupons } = req.body;
      if (!name || !price || !paymentLink || !description) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const snap = await db.ref("products").orderByChild("name").equalTo(name).once("value");
      if (snap.exists()) {
        return res.status(409).json({ error: "Ya existe un producto con ese nombre" });
      }

      const product: Product = {
        name,
        price: Number(price),
        paymentLink,
        description,
        platform: platform || "Desconocida",
        coupons: coupons || [],
        createdAt: Date.now(),
      };

      const newRef = db.ref("products").push();
      await newRef.set(product);

      return res.status(201).json({ id: newRef.key, ...product });
    }

    if (req.method === "DELETE") {
      const secret = req.headers["x-admin-secret"];
      if (secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const { name } = req.query;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Falta el nombre del producto" });
      }

      const snap = await db.ref("products").orderByChild("name").equalTo(name).once("value");
      if (!snap.exists()) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Eliminar el primer nodo que coincida
      const updates: Record<string, null> = {};
      snap.forEach(child => {
        updates[child.key!] = null;
        return true; // solo el primero
      });
      await db.ref("products").update(updates);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
