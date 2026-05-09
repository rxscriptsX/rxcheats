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

  if (!product) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Plataforma: {product.platform}</p>
      <p>Precio: {product.price} €</p>
      <Link href={`/checkout/payment/${encodeURIComponent(product.name)}`} style={{ backgroundColor: "#fff", color: "#000", padding: "0.8rem 2rem", borderRadius: "8px", textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
        Comprar ahora
      </Link>
    </div>
  );
}
