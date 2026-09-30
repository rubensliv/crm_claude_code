"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar } from "../acoes";
import estilos from "./login.module.css";

const estadoInicial = { ok: null, mensagem: "" };

export default function FormLogin() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className={estilos.form}>
      <label className={estilos.rotulo}>
        Usuário
        <input
          className={estilos.campo}
          type="text"
          name="usuario"
          autoComplete="username"
          autoFocus
        />
      </label>

      <label className={estilos.rotulo}>
        Senha
        <input
          className={estilos.campo}
          type="password"
          name="senha"
          autoComplete="current-password"
        />
      </label>

      <button className={estilos.botao} type="submit" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      {estado.mensagem ? (
        <p className={estilos.erro} role="status" aria-live="polite">
          {estado.mensagem}
        </p>
      ) : null}

      <p className={estilos.rodapeLink}>
        Não tem cadastro? <Link href="/register">Criar conta</Link>
      </p>
    </form>
  );
}
