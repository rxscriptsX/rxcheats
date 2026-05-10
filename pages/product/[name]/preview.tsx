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

  if (!product) return <p style={{ textAlign: "center", color: "#888", marginTop: "5rem" }}>Loading product...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.desc}>{product.description}</p>
      <div style={styles.meta}>
        <span>Platform: {product.platform}</span>
        <span style={styles.price}>{product.price} €</span>
      </div>
      <Link href={`/checkout/payment/${encodeURIComponent(product.name)}`} style={styles.buyBtn}>
        Buy now
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: "2.8rem", fontWeight: 200, letterSpacing: "1px", marginBottom: "1.5rem" },
  desc: { color: "#bbb", fontSize: "1.1rem", lineHeight: "1.7", marginBottom: "2rem" },
  meta: { display: "flex", justifyContent: "space-between", marginBottom: "2.5rem", color: "#999" },
  price: { fontSize: "2rem", fontWeight: 600, color: "#fff" },
  buyBtn: {
    display: "inline-block",
    background: "#fff",
    color: "#000",
    padding: "1.2rem 3rem",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1.1rem",
    letterSpacing: "0.5px",
    transition: "opacity 0.2s",
  },
};
