"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registrar } from "../acoes";
import estilos from "../login/login.module.css";

const estadoInicial = { ok: null, mensagem: "" };

export default function FormRegister() {
  const [estado, acao, enviando] = useActionState(registrar, estadoInicial);

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
          autoComplete="new-password"
        />
      </label>

      <label className={estilos.rotulo}>
        Repita a senha
        <input
          className={estilos.campo}
          type="password"
          name="senha2"
          autoComplete="new-password"
        />
      </label>

      <button className={estilos.botao} type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Criar conta"}
      </button>

      {estado.mensagem ? (
        <p
          className={estado.ok ? estilos.aviso : estilos.erro}
          role="status"
          aria-live="polite"
        >
          {estado.mensagem}
        </p>
      ) : null}

      <p className={estilos.rodapeLink}>
        Já tem cadastro? <Link href="/login">Entrar</Link>
      </p>
    </form>
  );
}
