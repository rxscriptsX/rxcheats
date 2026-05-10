import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "onlyalex";

function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
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
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  const handleAdminClick = () => {
    const password = prompt("Introduce la contraseña de administrador:");
    if (password === ADMIN_SECRET) {
      setShowAdminModal(true);
      fetchProducts();
    } else if (password !== null) {
      alert("Contraseña incorrecta");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCoupon = () => {
    setCoupons([...coupons, { code: "", discount: "" }]);
  };

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
        setAdminMsg("Producto creado exitosamente.");
        setProductForm({ name: "", price: "", paymentLink: "", description: "", platform: "" });
        setCoupons([]);
        fetchProducts();
      } else {
        setAdminMsg(data.error || "Error al crear producto.");
      }
    } catch {
      setAdminMsg("Error de conexión.");
    }
  };

  const deleteProduct = async (name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return;
    try {
      const res = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMsg("Producto eliminado correctamente.");
        fetchProducts();
      } else {
        setAdminMsg(data.error || "Error al eliminar producto.");
      }
    } catch {
      setAdminMsg("Error de conexión.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", padding: "1rem 2rem",
        borderBottom: "1px solid #333", alignItems: "center"
      }}>
        <Link href="/entry" style={{ color: "#fff", fontWeight: "bold", fontSize: "1.5rem", textDecoration: "none" }}>
          RXCHEATS
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {session ? (
            <>
              <span style={{ color: "#aaa" }}>
                {session.user?.name} #{session.user?.dashboardId}
              </span>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                background: "none", border: "1px solid #fff", color: "#fff", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer"
              }}>Cerrar sesión</button>
            </>
          ) : (
            <Link href="/login" style={{ color: "#fff", textDecoration: "none" }}>Iniciar sesión</Link>
          )}
        </div>
      </nav>
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>{children}</main>

      {/* Botón "+" flotante */}
      <button
        onClick={handleAdminClick}
        style={{
          position: "fixed", bottom: "20px", right: "20px",
          background: "#fff", color: "#000", border: "none", borderRadius: "50%",
          width: "50px", height: "50px", fontSize: "2rem", cursor: "pointer",
          boxShadow: "0 4px 15px rgba(255,255,255,0.3)"
        }}
      >
        +
      </button>

      {/* Modal de administración */}
      {showAdminModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", padding: "2rem",
            width: "90%", maxWidth: "700px", color: "#fff", maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ marginTop: 0 }}>Administrar Productos</h2>
            
            {/* Formulario de creación */}
            <div style={{ borderBottom: "1px solid #333", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
              <h3>Crear nuevo producto</h3>
              <input type="text" placeholder="Nombre del producto" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Precio" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} />
              <input type="text" placeholder="Enlace de pago" value={productForm.paymentLink} onChange={e => setProductForm({ ...productForm, paymentLink: e.target.value })} style={inputStyle} />
              <textarea placeholder="Descripción" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} rows={3} />
              <input type="text" placeholder="Plataforma (ej. PayPal)" value={productForm.platform} onChange={e => setProductForm({ ...productForm, platform: e.target.value })} style={inputStyle} />

              <h4>Cupones</h4>
              {coupons.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input type="text" placeholder="Código" value={c.code} onChange={e => {
                    const newCoupons = [...coupons];
                    newCoupons[i].code = e.target.value;
                    setCoupons(newCoupons);
                  }} style={inputStyle} />
                  <input type="number" placeholder="Descuento" value={c.discount} onChange={e => {
                    const newCoupons = [...coupons];
                    newCoupons[i].discount = e.target.value;
                    setCoupons(newCoupons);
                  }} style={inputStyle} />
                </div>
              ))}
              <button onClick={addCoupon} style={{ backgroundColor: "#333", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", marginBottom: "1rem", marginRight: "0.5rem" }}>+ Añadir cupón</button>
              
              <button onClick={createProduct} style={{
                backgroundColor: "#fff", color: "#000", border: "none", padding: "0.8rem", borderRadius: "8px",
                fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "0.5rem"
              }}>
                Publicar Producto
              </button>
              {adminMsg && <p style={{ marginTop: "0.5rem", color: adminMsg.includes("Error") || adminMsg.includes("error") ? "#ff6b6b" : "#51cf66" }}>{adminMsg}</p>}
            </div>

            {/* Lista de productos existentes */}
            <div>
              <h3>Productos existentes</h3>
              {products.length === 0 && <p style={{ color: "#aaa" }}>No hay productos. Crea el primero.</p>}
              {products.map((product: any) => (
                <div key={product.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  backgroundColor: "#222", borderRadius: "8px", padding: "0.8rem", marginBottom: "0.5rem"
                }}>
                  <div>
                    <strong>{product.name}</strong> - {product.price} €
                    <br />
                    <small style={{ color: "#aaa" }}>{product.platform}</small>
                  </div>
                  <button
                    onClick={() => deleteProduct(product.name)}
                    style={{
                      background: "none", border: "1px solid #ff6b6b", color: "#ff6b6b",
                      borderRadius: "6px", padding: "0.3rem 0.8rem", cursor: "pointer",
                      fontSize: "0.9rem"
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => { setShowAdminModal(false); setAdminMsg(""); }} style={{
              backgroundColor: "#555", color: "#fff", border: "none", padding: "0.8rem", borderRadius: "8px",
              width: "100%", marginTop: "1.5rem", cursor: "pointer"
            }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem", marginBottom: "0.8rem", borderRadius: "6px",
  border: "1px solid #444", backgroundColor: "#222", color: "#fff", fontSize: "0.95rem", outline: "none"
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
