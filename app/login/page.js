import { redirect } from "next/navigation";
import { lerSessao } from "../../lib/sessao";
import FormLogin from "./form-login";
import estilos from "./login.module.css";

// Sempre conferir a sessão a cada acesso.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Quem já está logado não precisa ver o login.
  if (await lerSessao()) {
    redirect("/");
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.cartao}>
        <h1 className={estilos.titulo}>Meu CRM</h1>
        <p className={estilos.apoio}>Entre para acessar seus contatos.</p>
        <FormLogin />
      </div>
    </main>
  );
}
