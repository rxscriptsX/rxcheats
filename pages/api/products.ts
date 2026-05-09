import { kv } from "@vercel/kv";
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
  const key = "products";

  if (req.method === "GET") {
    const products = await kv.get<Product[]>(key) || [];
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

    const products = await kv.get<Product[]>(key) || [];
    // Evitar nombre duplicado
    if (products.find(p => p.name === name)) {
      return res.status(409).json({ error: "Ya existe un producto con ese nombre" });
    }

    const newProduct: Product = {
      name,
      price: Number(price),
      paymentLink,
      description,
      platform: platform || "Desconocida",
      coupons: coupons || [],
      createdAt: Date.now(),
    };
    products.push(newProduct);
    await kv.set(key, products);
    return res.status(201).json(newProduct);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
