import { db } from "../../../lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "No autorizado" });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nombre del producto requerido" });
  }

  try {
    // Buscar el producto por nombre para obtener su key
    const snapshot = await db.ref("products").orderByChild("name").equalTo(name).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener la key del primer (y único) producto con ese nombre
    const products = snapshot.val();
    const productKey = Object.keys(products)[0];

    // Eliminar el producto
    await db.ref(`products/${productKey}`).remove();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
