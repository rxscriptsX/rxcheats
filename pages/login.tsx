import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/entry");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>RXCHEATS</h1>
        <p style={styles.subtitle}>Dashboard de productos</p>
        <button
          onClick={() => signIn("github", { callbackUrl: "/entry" })}
          style={styles.githubButton}
        >
          <svg height="24" viewBox="0 0 16 16" width="24" style={{ fill: "#fff" }}>
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Iniciar sesión con GitHub
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "rgba(20,20,20,0.95)",
    border: "1px solid #333",
    borderRadius: "20px",
    padding: "3rem 2.5rem",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: "2.5rem",
    fontWeight: 200,
    letterSpacing: "4px",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#aaa",
    fontSize: "1rem",
    marginBottom: "2rem",
  },
  githubButton: {
    backgroundColor: "#24292e",
    color: "#fff",
    border: "none",
    padding: "0.9rem 2rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.7rem",
    transition: "background 0.2s",
    width: "100%",
    justifyContent: "center",
  },
  loadingContainer: {
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export async function getServerSideProps() {
  return { props: {} };
}
