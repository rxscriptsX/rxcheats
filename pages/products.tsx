import { useEffect, useState } from "react";
import Link from "next/link";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      {loading && <p>Cargando...</p>}
      {!loading && products.length === 0 && <p>No hay productos disponibles.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
        {products.map((p: any) => (
          <Link key={p.name} href={`/product/${encodeURIComponent(p.name)}/preview`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #333", borderRadius: "12px", padding: "1rem", backgroundColor: "#111" }}>
              <h2>{p.name}</h2>
              <p style={{ color: "#aaa" }}>{p.description?.substring(0, 100)}...</p>
              <p style={{ fontWeight: "bold" }}>{p.price} €</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
