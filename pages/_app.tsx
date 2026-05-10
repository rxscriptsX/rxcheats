import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "onlyalex";

function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    paymentLink: "",
    description: "",
    platform: "",
  });
  const [coupons, setCoupons] = useState<{ code: string; discount: string }[]>([]);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchAdminProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setAdminProducts(data || []);
    } catch {}
    setLoadingProducts(false);
  };

  const handleAdminClick = () => {
    const password = prompt("Introduce la contraseña de administrador:");
    if (password === ADMIN_SECRET) {
      setShowAdminModal(true);
      fetchAdminProducts();
    } else if (password !== null) {
      alert("Contraseña incorrecta");
    }
  };

  const addCoupon = () => setCoupons([...coupons, { code: "", discount: "" }]);

  const createProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.paymentLink || !productForm.description) {
      setAdminMsg("Todos los campos obligatorios deben estar completos.");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          coupons: coupons.map(c => ({ code: c.code, discount: Number(c.discount) })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMsg("Producto creado.");
        setProductForm({ name: "", price: "", paymentLink: "", description: "", platform: "" });
        setCoupons([]);
        fetchAdminProducts();
      } else {
        setAdminMsg(data.error || "Error");
      }
    } catch {
      setAdminMsg("Error de conexión.");
    }
  };

  const deleteProduct = async (productName: string) => {
    if (!confirm(`¿Eliminar "${productName}"?`)) return;
    try {
      const res = await fetch(`/api/products?name=${encodeURIComponent(productName)}`, {
        method: "DELETE",
        headers: { "x-admin-secret": ADMIN_SECRET },
      });
      if (res.ok) {
        fetchAdminProducts();
      } else {
        const data = await res.json();
        setAdminMsg(data.error || "Error al eliminar");
      }
    } catch {
      setAdminMsg("Error de conexión al eliminar.");
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.wrapper}>
        <nav style={styles.nav}>
          <Link href="/entry" style={styles.logo}>RXCHEATS</Link>
          <div style={styles.navRight}>
            {session ? (
              <>
                <span style={styles.userInfo}>
                  {session.user?.name} <span style={styles.badge}>#{session.user?.dashboardId}</span>
                </span>
                <button onClick={() => signOut({ callbackUrl: "/" })} style={styles.navBtn}>Cerrar sesión</button>
              </>
            ) : (
              <Link href="/login" style={styles.navBtn}>Iniciar sesión</Link>
            )}
          </div>
        </nav>
        <main style={styles.main}>{children}</main>

        {/* Botón "+" flotante */}
        <button onClick={handleAdminClick} style={styles.fab}>+</button>

        {/* Modal admin */}
        {showAdminModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={{ marginTop: 0, fontWeight: 600 }}>Administrar Productos</h2>

              {/* Formulario de creación */}
              <div style={{ marginBottom: "2rem" }}>
                <input type="text" placeholder="Nombre" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={styles.input} />
                <input type="number" placeholder="Precio (€)" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={styles.input} />
                <input type="text" placeholder="Enlace de pago" value={productForm.paymentLink} onChange={e => setProductForm({ ...productForm, paymentLink: e.target.value })} style={styles.input} />
                <textarea placeholder="Descripción" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} style={{ ...styles.input, resize: "vertical" }} />
                <input type="text" placeholder="Plataforma (ej. PayPal)" value={productForm.platform} onChange={e => setProductForm({ ...productForm, platform: e.target.value })} style={styles.input} />

                <h3>Cupones</h3>
                {coupons.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input type="text" placeholder="Código" value={c.code} onChange={e => { const nc = [...coupons]; nc[i].code = e.target.value; setCoupons(nc); }} style={styles.input} />
                    <input type="number" placeholder="Descuento (€)" value={c.discount} onChange={e => { const nc = [...coupons]; nc[i].discount = e.target.value; setCoupons(nc); }} style={styles.input} />
                  </div>
                ))}
                <button onClick={addCoupon} style={styles.secondaryBtn}>+ Añadir cupón</button>
                <button onClick={createProduct} style={styles.primaryBtn}>Publicar Producto</button>
                {adminMsg && <p style={{ marginTop: "0.5rem", color: adminMsg.includes("Error") ? "#ff6b6b" : "#51cf66" }}>{adminMsg}</p>}
              </div>

              {/* Lista de productos con opción de eliminar */}
              <div>
                <h3>Productos existentes</h3>
                {loadingProducts && <p>Cargando...</p>}
                {!loadingProducts && adminProducts.length === 0 && <p style={{ color: "#aaa" }}>No hay productos.</p>}
                {adminProducts.map((p: any) => (
                  <div key={p.name} style={styles.productItem}>
                    <div>
                      <strong>{p.name}</strong> – {p.price}€
                    </div>
                    <button onClick={() => deleteProduct(p.name)} style={styles.deleteBtn}>🗑️</button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowAdminModal(false)} style={{ ...styles.secondaryBtn, width: "100%", marginTop: "1rem" }}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

// ==================== ESTILOS FULL‑SCREEN PROFESIONALES ====================
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at bottom, #1a1a1a 0%, #0d0d0d 100%)",
    color: "#fff",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 3rem",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.02)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "1.8rem",
    fontWeight: 300,
    letterSpacing: "6px",
    color: "#fff",
    textDecoration: "none",
    textTransform: "uppercase" as const,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  userInfo: {
    fontSize: "0.9rem",
    color: "#ccc",
  },
  badge: {
    backgroundColor: "#333",
    padding: "0.1rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#aaa",
  },
  navBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "0.4rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    textDecoration: "none",
    transition: "background 0.2s",
  },
  main: {
    flex: 1,
    padding: "3rem 3rem",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  fab: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "50%",
    width: "56px",
    height: "56px",
    fontSize: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1000,
    transition: "transform 0.2s",
    fontWeight: 300,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#111",
    border: "1px solid #333",
    borderRadius: "20px",
    padding: "2.5rem",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "80vh",
    overflowY: "auto",
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    marginBottom: "0.8rem",
    borderRadius: "10px",
    border: "1px solid #333",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    padding: "0.9rem 2rem",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
    marginTop: "0.8rem",
    transition: "opacity 0.2s",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    border: "1px solid #555",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  productItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0",
    borderBottom: "1px solid #222",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    cursor: "pointer",
    fontSize: "1.2rem",
  },
};
