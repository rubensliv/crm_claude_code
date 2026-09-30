import Link from "next/link";
import { sair } from "./acoes";
import estilos from "./page.module.css";

// Barra de navegação das páginas internas. Recebe a sessão de quem está
// logado; o link "Usuários" só aparece para o admin.
export default function Navbar({ sessao, atual }) {
  return (
    <nav className={estilos.navbar}>
      <div className={estilos.navMarca}>Meu CRM</div>

      <div className={estilos.navLinks}>
        <Link
          href="/"
          className={`${estilos.navLink} ${
            atual === "contatos" ? estilos.navLinkAtivo : ""
          }`}
        >
          Contatos
        </Link>

        {sessao.role === "admin" ? (
          <Link
            href="/usuarios"
            className={`${estilos.navLink} ${
              atual === "usuarios" ? estilos.navLinkAtivo : ""
            }`}
          >
            Usuários
          </Link>
        ) : null}
      </div>

      <div className={estilos.navDireita}>
        <span className={estilos.navUsuario}>
          {sessao.usuario}
          {sessao.role === "admin" ? " (admin)" : ""}
        </span>
        <form action={sair}>
          <button type="submit" className={estilos.botaoSair}>
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}
