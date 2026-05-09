import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Entry() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Cargando...</p>;
  if (!session) { router.push("/login"); return null; }

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Bienvenido, {session.user?.name} #{session.user?.dashboardId}</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "3rem" }}>
        <Link href="/products" style={buttonStyle}>Products</Link>
        <Link href="/reviews" style={buttonStyle}>Reviews</Link>
        <Link href="/faq" style={buttonStyle}>FAQ</Link>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#fff", color: "#000", padding: "1rem 2rem", borderRadius: "8px",
  textDecoration: "none", fontWeight: "bold", fontSize: "1.2rem"
};
