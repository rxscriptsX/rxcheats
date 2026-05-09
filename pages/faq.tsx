import Link from "next/link";

export default function Faq() {
  return (
    <div>
      <h1>Preguntas frecuentes</h1>
      <Link href="/faq/para-que-sirve-esto" style={{ color: "#fff", textDecoration: "underline" }}>
        ¿Para qué sirve esto?
      </Link>
    </div>
  );
}
