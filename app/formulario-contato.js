"use client";

import { useActionState, useEffect, useState } from "react";
import { criarContato } from "./acoes";
import estilos from "./page.module.css";

const estadoInicial = { ok: null, mensagem: "" };
const camposVazios = { nome: "", email: "", telefone: "" };

// Vai montando (XX) XXXXX-XXXX conforme a pessoa digita.
// Até 10 dígitos usa o desenho de fixo, (XX) XXXX-XXXX; no 11º vira celular.
function aplicarMascaraTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function FormularioContato() {
  const [estado, acao, enviando] = useActionState(criarContato, estadoInicial);

  // O React guarda o que foi digitado. Assim, quando a validação recusa,
  // o texto continua nos campos em vez de sumir.
  const [valores, setValores] = useState(camposVazios);

  // Limpa só quando o contato foi mesmo salvo.
  useEffect(() => {
    if (estado.ok) {
      setValores(camposVazios);
    }
  }, [estado]);

  function aoDigitar(evento) {
    const { name, value } = evento.target;
    const novoValor = name === "telefone" ? aplicarMascaraTelefone(value) : value;
    setValores((atuais) => ({ ...atuais, [name]: novoValor }));
  }

  return (
    <form action={acao} noValidate>
      <div className={estilos.campos}>
        <label className={estilos.rotulo}>
          Nome
          <input
            className={estilos.campo}
            type="text"
            name="nome"
            value={valores.nome}
            onChange={aoDigitar}
            placeholder="Ana Ribeiro"
            autoComplete="off"
          />
        </label>

        <label className={estilos.rotulo}>
          Email
          <input
            className={estilos.campo}
            type="email"
            name="email"
            value={valores.email}
            onChange={aoDigitar}
            placeholder="ana@exemplo.com.br"
            autoComplete="off"
          />
        </label>

        <label className={estilos.rotulo}>
          Telefone
          <input
            className={estilos.campo}
            type="tel"
            name="telefone"
            value={valores.telefone}
            onChange={aoDigitar}
            placeholder="(11) 98877-1234"
            autoComplete="off"
          />
        </label>
      </div>

      <div className={estilos.rodapeFormulario}>
        <button className={estilos.botao} type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar contato"}
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
