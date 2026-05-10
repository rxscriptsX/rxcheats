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
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

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

    setIsApplyingCoupon(true);
    setCouponMsg("");

    // Simular espera de 20 segundos con "Secure Xcolla"
    await new Promise(resolve => setTimeout(resolve, 20000));

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
        setCouponMsg(`Coupon applied! You save ${data.discount} €`);
      } else {
        setCouponMsg(data.error || "Invalid coupon code");
        setDiscount(0);
        setFinalPrice(product.price);
      }
    } catch {
      setCouponMsg("Connection error while verifying coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  if (!product) return <p style={{ textAlign: "center", color: "#888", marginTop: "5rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.desc}>{product.description}</p>
      <div style={styles.row}>
        <span>Platform: {product.platform}</span>
        <span style={styles.price}>{finalPrice} €</span>
      </div>
      {discount > 0 && <p style={{ color: "#4caf50", marginBottom: "1rem" }}>Discount: -{discount} €</p>}

      {/* Sección de cupón con animación de 20s y texto "Secure Xcolla" */}
      <div style={styles.couponBox}>
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          style={styles.couponInput}
          disabled={isApplyingCoupon}
        />
        <button
          onClick={applyCoupon}
          style={{
            ...styles.applyBtn,
            opacity: isApplyingCoupon ? 0.6 : 1,
            cursor: isApplyingCoupon ? "not-allowed" : "pointer"
          }}
          disabled={isApplyingCoupon}
        >
          {isApplyingCoupon ? "Verifying..." : "Apply"}
        </button>

        {/* Spinner y mensaje "Secure Xcolla" */}
        {isApplyingCoupon && (
          <div style={styles.verifyingBox}>
            <div style={styles.spinner} />
            <p style={styles.verifyingText}>Contacting with Secure Xcolla...</p>
          </div>
        )}

        {/* Mensaje de resultado del cupón */}
        {!isApplyingCoupon && couponMsg && (
          <p style={{
            marginTop: "0.8rem",
            color: couponMsg.includes("Invalid") || couponMsg.includes("error") ? "#ff6b6b" : "#4caf50",
            fontWeight: 500,
          }}>
            {couponMsg}
          </p>
        )}
      </div>

      {/* Botón Buy right now */}
      {!showPayment && (
        <button onClick={handleBuyNow} style={styles.buyBtn}>
          Buy right now
        </button>
      )}

      {/* Iframe de pago que se abre justo debajo */}
      {showPayment && (
        <div style={styles.paymentFrameContainer}>
          <div style={styles.paymentFrameHeader}>
            <span>Secure Payment</span>
            <button onClick={() => setShowPayment(false)} style={styles.closeFrameBtn}>✕</button>
          </div>
          <iframe
            src={product.paymentLink}
            style={styles.paymentIframe}
            title="Payment"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
          />
        </div>
      )}
    </div>
  );
}

// ==================== ESTILOS ====================
const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: "2.5rem", fontWeight: 300, marginBottom: "1rem" },
  desc: { color: "#ccc", lineHeight: "1.6", marginBottom: "2rem" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    color: "#aaa",
    fontSize: "1.1rem",
  },
  price: { fontSize: "2rem", fontWeight: 700, color: "#fff" },
  couponBox: {
    marginBottom: "2rem",
    position: "relative",
  },
  couponInput: {
    padding: "0.8rem",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    width: "calc(100% - 110px)",
    marginRight: "0.5rem",
    outline: "none",
    fontSize: "1rem",
  },
  applyBtn: {
    background: "#333",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  verifyingBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid rgba(255,255,255,0.2)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  verifyingText: {
    color: "#aaa",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  buyBtn: {
    display: "inline-block",
    background: "#fff",
    color: "#000",
    padding: "1.2rem 3rem",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1.1rem",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
    marginTop: "1rem",
  },
  paymentFrameContainer: {
    marginTop: "2rem",
    border: "1px solid #333",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#111",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },
  paymentFrameHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    backgroundColor: "#1a1a1a",
    borderBottom: "1px solid #333",
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#ccc",
  },
  closeFrameBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  paymentIframe: {
    width: "100%",
    height: "600px",
    border: "none",
  },
};

// Añadimos la animación del spinner al documento
export function GlobalStyle() {
  return (
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  );
}
