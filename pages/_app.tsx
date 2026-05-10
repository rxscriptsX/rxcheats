import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import Head from "next/head";
import { useState } from "react";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "onlyalex";

function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [showAdmin, setShowAdmin] = useState(false);
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

  const openAdmin = () => {
    const pw = prompt("Enter admin password:");
    if (pw === ADMIN_SECRET) {
      setShowAdmin(true);
      fetchAdminProducts();
    } else if (pw !== null) {
      alert("Wrong password");
    }
  };

  const addCoupon = () => setCoupons([...coupons, { code: "", discount: "" }]);

  const createProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.paymentLink || !productForm.description) {
      setAdminMsg("All required fields must be filled.");
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
        setAdminMsg("Product created successfully.");
        setProductForm({ name: "", price: "", paymentLink: "", description: "", platform: "" });
        setCoupons([]);
        fetchAdminProducts();
      } else {
        setAdminMsg(data.error || "Error creating product.");
      }
    } catch {
      setAdminMsg("Connection error.");
    }
  };

  const deleteProduct = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { "x-admin-secret": ADMIN_SECRET },
      });
      if (res.ok) {
        fetchAdminProducts();
      } else {
        const data = await res.json();
        setAdminMsg(data.error || "Error deleting product.");
      }
    } catch {
      setAdminMsg("Connection error.");
    }
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div style={styles.shell}>
        <nav style={styles.nav}>
          <Link href="/entry" style={styles.logo}>RXCHEATS</Link>
          <div style={styles.navRight}>
            {session ? (
              <>
                <span style={styles.user}>
                  {session.user?.name}{' '}
                  <span style={styles.badge}>#{session.user?.dashboardId}</span>
                </span>
                <button onClick={() => signOut({ callbackUrl: "/" })} style={styles.navBtn}>Log out</button>
              </>
            ) : (
              <Link href="/login" style={styles.navBtn}>Sign in</Link>
            )}
          </div>
        </nav>
        <main style={styles.main}>{children}</main>
        <button onClick={openAdmin} style={styles.fab}>+</button>

        {showAdmin && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Product Administration</h2>

              {/* Create */}
              <div style={{ marginBottom: '2rem' }}>
                <input type="text" placeholder="Product name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={styles.input} />
                <input type="number" placeholder="Price (€)" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={styles.input} />
                <input type="text" placeholder="Payment link" value={productForm.paymentLink} onChange={e => setProductForm({...productForm, paymentLink: e.target.value})} style={styles.input} />
                <textarea placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} style={{...styles.input, resize:'vertical'}} />
                <input type="text" placeholder="Platform (e.g. PayPal)" value={productForm.platform} onChange={e => setProductForm({...productForm, platform: e.target.value})} style={styles.input} />

                <h3 style={{ fontWeight: 500, margin: '1rem 0 0.5rem' }}>Coupons</h3>
                {coupons.map((c, i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                    <input type="text" placeholder="Code" value={c.code} onChange={e => { const n = [...coupons]; n[i].code = e.target.value; setCoupons(n); }} style={styles.input} />
                    <input type="number" placeholder="Discount (€)" value={c.discount} onChange={e => { const n = [...coupons]; n[i].discount = e.target.value; setCoupons(n); }} style={styles.input} />
                  </div>
                ))}
                <button onClick={addCoupon} style={styles.secondaryBtn}>+ Add coupon</button>
                <button onClick={createProduct} style={styles.primaryBtn}>Publish Product</button>
                {adminMsg && <p style={{ marginTop:'0.5rem', color: adminMsg.includes('Error') ? '#ff6b6b' : '#51cf66' }}>{adminMsg}</p>}
              </div>

              {/* Product list with delete */}
              <div>
                <h3 style={{ fontWeight: 500 }}>Existing Products</h3>
                {loadingProducts && <p>Loading...</p>}
                {!loadingProducts && adminProducts.length === 0 && <p style={{ color:'#888' }}>No products yet.</p>}
                {adminProducts.map((p:any) => (
                  <div key={p.name} style={styles.productRow}>
                    <div>
                      <strong>{p.name}</strong> – {p.price}€
                    </div>
                    <button onClick={() => deleteProduct(p.name)} style={styles.deleteBtn}>🗑️</button>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowAdmin(false)} style={{...styles.secondaryBtn, width:'100%', marginTop:'1.5rem'}}>Close</button>
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

// ==================== REFINED STYLES ====================
const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "#0a0a0a",
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
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    background: "rgba(10,10,10,0.7)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "1.8rem",
    fontWeight: 200,
    letterSpacing: "8px",
    color: "#fff",
    textDecoration: "none",
    textTransform: "uppercase" as const,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  user: {
    color: "#ccc",
    fontSize: "0.9rem",
  },
  badge: {
    backgroundColor: "#222",
    padding: "0.15rem 0.6rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#aaa",
    marginLeft: "0.4rem",
  },
  navBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "0.5rem 1.5rem",
    borderRadius: "10px",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "border-color 0.2s",
  },
  main: {
    flex: 1,
    padding: "3rem 3rem",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  fab: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
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
    fontWeight: 300,
    transition: "transform 0.2s",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
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
  modalTitle: {
    marginTop: 0,
    fontWeight: 500,
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
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
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "0.9rem 2rem",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
    marginTop: "0.8rem",
    transition: "opacity 0.2s",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid #444",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  productRow: {
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
