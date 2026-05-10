import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductPreview() {
  const router = useRouter();
  const { name } = router.query;
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (name) {
      fetch(`/api/products/${encodeURIComponent(name as string)}`)
        .then(r => r.json())
        .then(data => setProduct(data));
    }
  }, [name]);

  if (!product) return <p style={{ textAlign: "center", color: "#aaa", marginTop: "4rem" }}>Cargando...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.desc}>{product.description}</p>
      <div style={styles.meta}>
        <span>Plataforma: {product.platform}</span>
        <span style={styles.price}>{product.price} €</span>
      </div>
      <Link href={`/checkout/payment/${encodeURIComponent(product.name)}`} style={styles.buyBtn}>
        Comprar ahora
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: "2.5rem", fontWeight: 300, marginBottom: "1rem" },
  desc: { color: "#bbb", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "2rem" },
  meta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", color: "#aaa" },
  price: { fontSize: "1.5rem", fontWeight: 700, color: "#fff" },
  buyBtn: {
    display: "inline-block",
    backgroundColor: "#fff",
    color: "#000",
    padding: "1rem 2.5rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "1.1rem",
    transition: "opacity 0.2s",
  },
};
