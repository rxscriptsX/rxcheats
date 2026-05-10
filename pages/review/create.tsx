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
        setMessage(data.error || "Error publishing review");
      }
    } catch {
      setMessage("Connection error");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={styles.title}>New Review</h1>
      <form onSubmit={submit}>
        <input type="text" placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={styles.input} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required style={{...styles.input, resize: "vertical"}} rows={5} />
        <select value={stars} onChange={e => setStars(Number(e.target.value))} style={styles.input}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
        </select>
        <button type="submit" style={styles.submitBtn}>Publish review</button>
        {message && <p style={{ marginTop: "1rem", color: message.includes("Error") ? "#ff6b6b" : "#51cf66" }}>{message}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: "2rem", fontWeight: 300, marginBottom: "2rem" },
  input: {
    width: "100%", padding: "0.9rem", marginBottom: "1rem", borderRadius: "10px",
    border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: "1rem", outline: "none",
  },
  submitBtn: {
    background: "#fff", color: "#000", border: "none", padding: "1rem 2rem", borderRadius: "12px",
    fontWeight: 600, cursor: "pointer", fontSize: "1rem", width: "100%", marginTop: "0.5rem",
  },
};
