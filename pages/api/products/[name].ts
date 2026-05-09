import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "Falta el nombre" });

  const products = await kv.get<any[]>("products") || [];
  const product = products.find(p => p.name === name);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  return res.status(200).json(product);
}
