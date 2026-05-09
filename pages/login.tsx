import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/entry");
  }, [status, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>RXCHEATS</h1>
      <button
        onClick={() => signIn("github")}
        style={{
          backgroundColor: "#fff", color: "#000", border: "none", padding: "1rem 2rem",
          fontSize: "1.2rem", fontWeight: "bold", borderRadius: "8px", cursor: "pointer"
        }}
      >
        Iniciar sesión con GitHub
      </button>
    </div>
  );
}
