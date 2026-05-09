import { useState } from "react";
import { useRouter } from "next/router";

export default function CreateReview() {
  const [productName, setProductName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState(5);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, title, description, stars }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/reviews");
      } else {
        setMessage(data.error || "Error al publicar");
      }
    } catch {
      setMessage("Error de conexión");
    }
  };

  return (
    <div>
      <h1>Nueva Reseña</h1>
      <form onSubmit={submit}>
        <input type="text" placeholder="Nombre del producto" value={productName} onChange={e => setProductName(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} required style={inputStyle} rows={4} />
        <select value={stars} onChange={e => setStars(Number(e.target.value))} style={inputStyle}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrellas</option>)}
        </select>
        <button type="submit" style={{ backgroundColor: "#fff", color: "#000", padding: "0.8rem 2rem", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Publicar reseña
        </button>
        {message && <p style={{ color: message.includes("Error") ? "#ff6b6b" : "#51cf66" }}>{message}</p>}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: "6px",
  border: "1px solid #444", backgroundColor: "#222", color: "#fff", fontSize: "1rem"
};
