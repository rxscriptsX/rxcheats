import { useRouter } from "next/router";

export default function FaqDetail() {
  const router = useRouter();
  const { title } = router.query;

  return (
    <div>
      <h1>{title}</h1>
      <p>{title === "para-que-sirve-esto" ? "Somos una empresa realizada en hacer cheats para muchos diferentes juegos tenemos de todo, y en esta plataforma es muy fácil pagar y muy seguro, también te puedes unir a nuestro servidor de Discord que es este: https://discord.gg/Synsza5ZFP" : "No hay información adicional."}</p>
    </div>
  );
}
