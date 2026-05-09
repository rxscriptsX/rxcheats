import { db } from "../../../lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "Falta el nombre" });

  try {
    const snapshot = await db.ref("products").orderByChild("name").equalTo(name).once("value");
    if (!snapshot.exists()) return res.status(404).json({ error: "Producto no encontrado" });

    const products = snapshot.val();
    const product = Object.values(products)[0]; // tomamos el primero
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno" });
  }
}
