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
      <h1 style={styles.heading}>Products</h1>
      {loading && <p style={styles.status}>Loading catalogue...</p>}
      {!loading && products.length === 0 && <p style={styles.status}>No products available yet.</p>}
      <div style={styles.grid}>
        {products.map((p: any) => (
          <Link key={p.name} href={`/product/${encodeURIComponent(p.name)}/preview`} style={{ textDecoration: "none" }}>
            <div style={styles.card}>
              <h2 style={styles.name}>{p.name}</h2>
              <p style={styles.desc}>{p.description?.substring(0, 100)}…</p>
              <div style={styles.footer}>
                <span style={styles.price}>{p.price} €</span>
                <span style={styles.platform}>{p.platform}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: "2.2rem",
    fontWeight: 300,
    letterSpacing: "2px",
    marginBottom: "2rem",
  },
  status: {
    textAlign: "center",
    color: "#888",
    marginTop: "3rem",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
  },
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    padding: "2rem",
    transition: "border-color 0.2s, transform 0.1s",
    cursor: "pointer",
  },
  name: {
    fontSize: "1.5rem",
    fontWeight: 600,
    margin: "0 0 0.5rem",
  },
  desc: {
    color: "#aaa",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    marginBottom: "1.5rem",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#fff",
  },
  platform: {
    color: "#888",
    fontSize: "0.85rem",
  },
};
