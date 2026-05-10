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
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showGoToPay, setShowGoToPay] = useState(false);

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
    setValidatingCoupon(true);
    setCouponMsg("Contacting with Secure Xcolla...");

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
        setCouponMsg(`Coupon applied! You save ${data.discount} €.`);
      } else {
        setCouponMsg(data.error || "Invalid coupon code.");
        setDiscount(0);
        setFinalPrice(product.price);
      }
    } catch {
      setCouponMsg("Connection error. Please try again.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (!product) return <p style={{ textAlign: "center", color: "#888", marginTop: "5rem" }}>Loading...</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.productName}>{product.name}</h1>
        <p style={styles.description}>{product.description}</p>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.label}>Platform</span>
            <span style={styles.value}>{product.platform}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>Price</span>
            <span style={styles.value}>{product.price} €</span>
          </div>
          {discount > 0 && (
            <div style={styles.detailRow}>
              <span style={styles.label}>Discount</span>
              <span style={{ ...styles.value, color: "#4caf50" }}>-{discount} €</span>
            </div>
          )}
          <div style={{ ...styles.detailRow, borderTop: "1px solid #333", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <span style={{ ...styles.label, fontWeight: 600, color: "#fff" }}>Total</span>
            <span style={{ ...styles.value, fontWeight: 700, fontSize: "1.5rem", color: "#fff" }}>{finalPrice} €</span>
          </div>
        </div>

        {/* Coupon section */}
        <div style={styles.couponBox}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              style={styles.couponInput}
              disabled={validatingCoupon}
            />
            <button onClick={applyCoupon} style={styles.applyBtn} disabled={validatingCoupon}>
              {validatingCoupon ? "Validating..." : "Apply"}
            </button>
          </div>
          {couponMsg && (
            <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", color: couponMsg.includes("Invalid") || couponMsg.includes("Error") ? "#ff6b6b" : "#4caf50" }}>
              {validatingCoupon && <span style={styles.spinner}></span>}
              <span>{couponMsg}</span>
            </div>
          )}
        </div>

        {/* PayPal button (static) */}
        <button
          onClick={() => setShowGoToPay(true)}
          style={{
            ...styles.paypalButton,
            opacity: showGoToPay ? 0.7 : 1,
            cursor: showGoToPay ? "default" : "pointer",
          }}
          disabled={showGoToPay}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: "0.5rem" }}>
            <path d="M7.076 21.334H4.47a.722.722 0 0 1-.718-.625L2.066 5.771a.723.723 0 0 1 .718-.82h3.898c.633 0 1.146.513 1.192 1.144l.066.42c.157.997.944 1.71 1.94 1.71h2.243c1.594 0 2.88 1.27 2.88 2.86 0 .13-.008.258-.025.384-.206 1.564-1.507 2.735-3.094 2.735H8.034a1.194 1.194 0 0 0-1.186 1.144l-.003.015-.844 5.383a.723.723 0 0 1-.718.626h-.002z" fill="#009CDE"/>
            <path d="M17.672 8.309h-3.67c-.63 0-1.142.511-1.188 1.139l-.066.418c-.157.996-.942 1.709-1.936 1.709H9.676c-1.59 0-2.873 1.267-2.873 2.853 0 .13.009.258.025.383.206 1.563 1.504 2.733 3.088 2.733h1.87c.598 0 1.084.485 1.084 1.083v.273l.84 5.354a.723.723 0 0 0 .718.625h2.514a.723.723 0 0 0 .718-.625l.906-5.764a.723.723 0 0 1 .718-.625h.791c2.245 0 4.064-1.82 4.064-4.064v-.279c0-2.242-1.82-4.064-4.064-4.064z" fill="#00457C"/>
          </svg>
          PayPal
        </button>

        {/* Go to Pay button */}
        {showGoToPay && (
          <button
            onClick={() => {
              if (product?.paymentLink) {
                window.open(product.paymentLink, '_blank');
              }
            }}
            style={styles.goToPayButton}
          >
            Go to Pay
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "3rem 1rem",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: "rgba(20,20,20,0.9)",
    border: "1px solid #333",
    borderRadius: "20px",
    padding: "2.5rem",
    maxWidth: "550px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    backdropFilter: "blur(16px)",
  },
  productName: {
    fontSize: "2rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#fff",
  },
  description: {
    color: "#aaa",
    lineHeight: "1.6",
    marginBottom: "2rem",
  },
  details: {
    marginBottom: "2rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.6rem 0",
    borderBottom: "1px solid #222",
  },
  label: {
    color: "#888",
    fontWeight: 500,
  },
  value: {
    color: "#fff",
    fontWeight: 500,
  },
  couponBox: {
    marginBottom: "2rem",
  },
  couponInput: {
    flex: 1,
    padding: "0.8rem",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  applyBtn: {
    background: "#333",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.4rem",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    whiteSpace: "nowrap",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  paypalButton: {
    background: "#FFC439",
    color: "#000",
    border: "none",
    padding: "1rem",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "1.2rem",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    transition: "opacity 0.2s",
    cursor: "pointer",
  },
  goToPayButton: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "1rem",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "1.2rem",
    width: "100%",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

// Add spinner keyframe globally
export function Head() {
  return (
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  );
}
