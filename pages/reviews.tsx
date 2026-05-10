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
      <h1 style={styles.heading}>Reviews</h1>
      <Link href="/review/create" style={styles.newBtn}>Write a review</Link>
      {loading && <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>Loading...</p>}
      {!loading && reviews.length === 0 && <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>No reviews yet.</p>}
      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {reviews.map((r: any) => (
          <div key={r.id} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              <h3>{r.title} <span style={{ color: "#888" }}>– {r.productName}</span></h3>
              <div>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
            </div>
            <p style={{ color: "#bbb" }}>{r.description}</p>
            <small style={{ color: "#666" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: "2.2rem", fontWeight: 300, marginBottom: "1rem" },
  newBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff", padding: "0.7rem 1.8rem", borderRadius: "10px", textDecoration: "none",
    fontWeight: 500, display: "inline-block", marginBottom: "1rem",
  },
  reviewCard: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "1.5rem",
  },
  reviewHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "0.5rem",
  },
};
