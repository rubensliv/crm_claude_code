import { redirect } from "next/navigation";
import { lerSessao } from "../../lib/sessao";
import FormRegister from "./form-register";
import estilos from "../login/login.module.css";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // Quem já está logado não precisa se cadastrar.
  if (await lerSessao()) {
    redirect("/");
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.cartao}>
        <h1 className={estilos.titulo}>Criar conta</h1>
        <p className={estilos.apoio}>
          Seu acesso fica pendente até um administrador aprovar.
        </p>
        <FormRegister />
      </div>
    </main>
  );
}
