import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const { name } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (name) {
      fetch(`/api/products/${encodeURIComponent(name as string)}`)
        .then(r => r.json())
        .then(data => {
          setProduct(data);
          setFinalPrice(data.price);
        });
    }
  }, [name]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name, code: couponCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount);
        setFinalPrice(product.price - data.discount);
        setCouponMsg("Coupon applied!");
      } else {
        setCouponMsg(data.error || "Invalid coupon");
        setDiscount(0);
        setFinalPrice(product.price);
      }
    } catch {
      setCouponMsg("Connection error");
    }
  };

  if (!product) return <p style={{ textAlign: "center", color: "#888", marginTop: "5rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.desc}>{product.description}</p>
      <div style={styles.row}>
        <span>Platform: {product.platform}</span>
        <span style={styles.price}>{finalPrice} €</span>
      </div>
      {discount > 0 && <p style={{ color: "#4caf50", marginBottom: "1rem" }}>Discount: -{discount} €</p>}

      <div style={styles.couponBox}>
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          style={styles.couponInput}
        />
        <button onClick={applyCoupon} style={styles.applyBtn}>Apply</button>
        {couponMsg && <p style={{ marginTop: "0.5rem", color: couponMsg.includes("Invalid") ? "#ff6b6b" : "#4caf50" }}>{couponMsg}</p>}
      </div>

      <a href={product.paymentLink} target="_blank" rel="noopener noreferrer" style={styles.buyBtn}>
        Buy right now
      </a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: "2.5rem", fontWeight: 300, marginBottom: "1rem" },
  desc: { color: "#ccc", lineHeight: "1.6", marginBottom: "2rem" },
  row: { display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "#aaa" },
  price: { fontSize: "2rem", fontWeight: 700, color: "#fff" },
  couponBox: { marginBottom: "2rem" },
  couponInput: {
    padding: "0.8rem", borderRadius: "10px", border: "1px solid #333", background: "#1a1a1a",
    color: "#fff", width: "calc(100% - 100px)", marginRight: "0.5rem", outline: "none",
  },
  applyBtn: {
    background: "#333", color: "#fff", border: "none", padding: "0.8rem 1.2rem",
    borderRadius: "10px", cursor: "pointer", fontWeight: 600,
  },
  buyBtn: {
    display: "inline-block", background: "#fff", color: "#000", padding: "1.2rem 3rem",
    borderRadius: "14px", textDecoration: "none", fontWeight: 600, fontSize: "1.1rem",
    marginTop: "1rem", transition: "opacity 0.2s",
  },
};
