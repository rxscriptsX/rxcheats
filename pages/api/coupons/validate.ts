import { db } from "../../../lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { productName, code } = req.body;
  if (!productName || !code) return res.status(400).json({ error: "Faltan datos" });

  try {
    const snapshot = await db.ref("products").orderByChild("name").equalTo(productName).once("value");
    if (!snapshot.exists()) return res.status(404).json({ error: "Producto no encontrado" });

    const products = snapshot.val();
    const product: any = Object.values(products)[0];

    const coupon = product.coupons?.find((c: any) => c.code === code);
    if (!coupon) return res.status(404).json({ error: "Cupón inválido" });

    return res.status(200).json({ discount: coupon.discount });
  } catch (error) {
    return res.status(500).json({ error: "Error interno" });
  }
}
