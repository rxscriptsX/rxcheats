import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { productName, code } = req.body;
  if (!productName || !code) return res.status(400).json({ error: "Faltan datos" });

  const products = await kv.get<any[]>("products") || [];
  const product = products.find(p => p.name === productName);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const coupon = product.coupons?.find((c: any) => c.code === code);
  if (!coupon) return res.status(404).json({ error: "Cupón inválido" });

  return res.status(200).json({ discount: coupon.discount });
}
