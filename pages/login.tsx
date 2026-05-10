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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.brand}>RXCHEATS</h1>
        <p style={styles.sub}>Dashboard for premium products</p>
        <button onClick={() => signIn("github", { callbackUrl: "/entry" })} style={styles.githubBtn}>
          <svg height="22" viewBox="0 0 16 16" width="22" style={{ fill: "#fff" }}>
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#0a0a0a",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "rgba(18,18,18,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "3rem 2.5rem",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
    backdropFilter: "blur(20px)",
  },
  brand: {
    fontSize: "2.8rem",
    fontWeight: 200,
    letterSpacing: "6px",
    marginBottom: "0.5rem",
  },
  sub: {
    color: "#888",
    fontSize: "1rem",
    marginBottom: "2.5rem",
  },
  githubBtn: {
    background: "#24292e",
    color: "#fff",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.8rem",
    width: "100%",
    justifyContent: "center",
    transition: "background 0.2s",
  },
};
