import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Entry() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</p>;
  if (!session) { router.push("/login"); return null; }

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 300, marginBottom: "0.5rem" }}>
        Welcome, {session.user?.name}
      </h1>
      <p style={{ color: "#888", fontSize: "1rem", marginBottom: "3rem" }}>
        Dashboard ID: <span style={{ fontWeight: 600, color: "#fff" }}>#{session.user?.dashboardId}</span>
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
        <Link href="/products" style={navCard}>Products</Link>
        <Link href="/reviews" style={navCard}>Reviews</Link>
        <Link href="/faq" style={navCard}>FAQ</Link>
      </div>
    </div>
  );
}

const navCard: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "2rem 3rem",
  color: "#fff",
  textDecoration: "none",
  fontSize: "1.3rem",
  fontWeight: 500,
  transition: "transform 0.2s, border-color 0.2s",
  backdropFilter: "blur(10px)",
  minWidth: "160px",
};
