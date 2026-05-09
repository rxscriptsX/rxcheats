import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const { name } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
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
        setCouponError("");
      } else {
        setCouponError(data.error || "Cupón inválido");
        setDiscount(0);
        setFinalPrice(product.price);
      }
    } catch {
      setCouponError("Error de conexión");
    }
  };

  if (!product) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Plataforma: {product.platform}</p>
      <p>Precio original: {product.price} €</p>
      {discount > 0 && <p style={{ color: "#4caf50" }}>Descuento aplicado: -{discount} €</p>}
      <p>Precio final: {finalPrice} €</p>
      <input
        type="text"
        placeholder="Código de cupón"
        value={couponCode}
        onChange={e => setCouponCode(e.target.value)}
        style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#222", color: "#fff", marginRight: "0.5rem" }}
      />
      <button onClick={applyCoupon} style={{ backgroundColor: "#fff", color: "#000", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>Aplicar</button>
      {couponError && <p style={{ color: "#ff6b6b" }}>{couponError}</p>}

      <a href={product.paymentLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", backgroundColor: "#fff", color: "#000", padding: "0.8rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", marginTop: "1rem" }}>
        Buy Right Now
      </a>
    </div>
  );
}
