import { useEffect, useState } from "react";
import Link from "next/link";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(data => setReviews(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Reseñas</h1>
      <Link href="/review/create" style={{ backgroundColor: "#fff", color: "#000", padding: "0.5rem 1rem", borderRadius: "4px", textDecoration: "none" }}>
        Escribir reseña
      </Link>
      {loading && <p>Cargando...</p>}
      {!loading && reviews.length === 0 && <p>No hay reseñas todavía.</p>}
      <div style={{ marginTop: "2rem" }}>
        {reviews.map((r: any) => (
          <div key={r.id} style={{ border: "1px solid #333", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#111" }}>
            <h3>{r.title} - {r.productName}</h3>
            <p>{r.description}</p>
            <p>{"⭐".repeat(r.stars)}</p>
            <small>{new Date(r.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
