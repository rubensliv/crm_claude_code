"use client";

import { useTransition } from "react";
import { aprovar } from "../acoes";
import estilos from "../page.module.css";

// Uma linha da lista de usuários: nome, papel, situação e (se pendente)
// o botão de aprovar.
export default function LinhaUsuario({ usuario }) {
  const [pendente, iniciar] = useTransition();

  function aprovarAgora() {
    iniciar(async () => {
      await aprovar(usuario.id);
    });
  }

  return (
    <li className={estilos.item}>
      <div className={estilos.itemTopo}>
        <span className={estilos.nome}>{usuario.usuario}</span>
        <span className={estilos.etiquetasUsuario}>
          <span
            className={`${estilos.etiqueta} ${
              usuario.role === "admin" ? estilos.papelAdmin : estilos.papelUser
            }`}
          >
            {usuario.role === "admin" ? "Admin" : "Usuário"}
          </span>
          <span
            className={`${estilos.etiqueta} ${
              usuario.status === "aprovado"
                ? estilos.statusAprovado
                : estilos.statusPendente
            }`}
          >
            {usuario.status === "aprovado" ? "Aprovado" : "Pendente"}
          </span>
        </span>
      </div>

      {usuario.status === "pendente" ? (
        <div className={estilos.acoesAnotacao}>
          <button
            type="button"
            className={`${estilos.botaoMini} ${estilos.botaoEditar}`}
            disabled={pendente}
            onClick={aprovarAgora}
          >
            {pendente ? "Aprovando..." : "Aprovar"}
          </button>
        </div>
      ) : null}
    </li>
  );
}
