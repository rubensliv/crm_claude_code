import { exigirAdmin } from "../../lib/sessao";
import { listarUsuarios } from "../../lib/usuarios";
import Navbar from "../navbar";
import FormNovoUsuario from "./form-novo-usuario";
import LinhaUsuario from "./linha-usuario";
import estilos from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  // Só administrador entra aqui.
  const sessao = await exigirAdmin();
  const usuarios = await listarUsuarios();

  const pendentes = usuarios.filter((u) => u.status === "pendente").length;

  return (
    <>
      <Navbar sessao={sessao} atual="usuarios" />
      <main className={estilos.pagina}>
        <div className={estilos.conteudo}>
          <header>
            <h1 className={estilos.titulo}>Usuários</h1>
            <p className={estilos.apoio}>
              {pendentes > 0
                ? `${pendentes} cadastro(s) aguardando aprovação.`
                : "Nenhum cadastro pendente."}
            </p>
          </header>

          <section className={estilos.cartao}>
            <h2 className={estilos.subtitulo}>Novo usuário</h2>
            <FormNovoUsuario />
          </section>

          <section className={estilos.cartao}>
            <ul className={estilos.lista}>
              {usuarios.map((u) => (
                <LinhaUsuario key={u.id} usuario={u} />
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
