"use client";

import { useActionState, useEffect, useState } from "react";
import { criarUsuarioPeloAdmin } from "../acoes";
import estilos from "../page.module.css";

const estadoInicial = { ok: null, mensagem: "" };
const camposVazios = { usuario: "", senha: "", senha2: "", role: "user" };

export default function FormNovoUsuario() {
  const [estado, acao, enviando] = useActionState(
    criarUsuarioPeloAdmin,
    estadoInicial
  );
  const [valores, setValores] = useState(camposVazios);

  // Limpa os campos só quando o usuário foi mesmo criado.
  useEffect(() => {
    if (estado.ok) setValores(camposVazios);
  }, [estado]);

  function aoDigitar(evento) {
    const { name, value } = evento.target;
    setValores((atuais) => ({ ...atuais, [name]: value }));
  }

  return (
    <form action={acao} noValidate>
      <div className={estilos.campos}>
        <label className={estilos.rotulo}>
          Usuário
          <input
            className={estilos.campo}
            type="text"
            name="usuario"
            value={valores.usuario}
            onChange={aoDigitar}
            autoComplete="off"
          />
        </label>

        <label className={estilos.rotulo}>
          Senha
          <input
            className={estilos.campo}
            type="password"
            name="senha"
            value={valores.senha}
            onChange={aoDigitar}
            autoComplete="new-password"
          />
        </label>

        <label className={estilos.rotulo}>
          Repita a senha
          <input
            className={estilos.campo}
            type="password"
            name="senha2"
            value={valores.senha2}
            onChange={aoDigitar}
            autoComplete="new-password"
          />
        </label>

        <label className={estilos.rotulo}>
          Papel
          <select
            className={estilos.campo}
            name="role"
            value={valores.role}
            onChange={aoDigitar}
          >
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      <div className={estilos.rodapeFormulario}>
        <button className={estilos.botao} type="submit" disabled={enviando}>
          {enviando ? "Criando..." : "Criar usuário"}
        </button>

        {estado.mensagem ? (
          <p
            className={estado.ok ? estilos.aviso : estilos.avisoErro}
            role="status"
            aria-live="polite"
          >
            {estado.mensagem}
          </p>
        ) : null}
      </div>
    </form>
  );
}
