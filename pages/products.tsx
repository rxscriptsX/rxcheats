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
      <h1 style={styles.title}>Productos</h1>
      {loading && <p style={styles.loading}>Cargando catálogo...</p>}
      {!loading && products.length === 0 && <p style={styles.empty}>No hay productos disponibles.</p>}
      <div style={styles.grid}>
        {products.map((p: any) => (
          <Link key={p.name} href={`/product/${encodeURIComponent(p.name)}/preview`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={styles.card}>
              <h2 style={styles.productName}>{p.name}</h2>
              <p style={styles.description}>{p.description?.substring(0, 120)}...</p>
              <p style={styles.price}>{p.price} €</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: "2.5rem",
    fontWeight: 300,
    letterSpacing: "2px",
    marginBottom: "2rem",
  },
  loading: {
    textAlign: "center",
    color: "#aaa",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "2rem",
    transition: "transform 0.2s, border-color 0.2s",
    cursor: "pointer",
  },
  productName: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  description: {
    color: "#aaa",
    fontSize: "0.95rem",
    marginBottom: "1rem",
  },
  price: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#fff",
  },
};
