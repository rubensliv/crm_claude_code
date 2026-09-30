"use client";

import { useEffect, useState } from "react";
import estilos from "./page.module.css";

// Onde a escolha fica guardada no navegador.
const CHAVE = "crm-fundo";

// Tons claros e sóbrios, todos com bom contraste para o texto grafite.
// O primeiro é o padrão do design.md.
const OPCOES = [
  { nome: "Creme", cor: "#FAFAF7" },
  { nome: "Branco", cor: "#FFFFFF" },
  { nome: "Cinza", cor: "#F2F2F0" },
  { nome: "Areia", cor: "#F4EFE6" },
  { nome: "Névoa", cor: "#EEF1F4" },
];

const PADRAO = OPCOES[0].cor;

export default function ConfiguracoesFundo() {
  // Começa no padrão (igual no servidor e no cliente, sem descompasso).
  const [ativa, setAtiva] = useState(PADRAO);

  // Depois de montar, sincroniza o destaque com o que já está salvo.
  // A cor em si já foi aplicada pelo script no layout, antes de pintar.
  useEffect(() => {
    try {
      const salva = localStorage.getItem(CHAVE);
      if (salva) setAtiva(salva);
    } catch (e) {
      // localStorage indisponível: segue no padrão.
    }
  }, []);

  function escolher(cor) {
    setAtiva(cor);
    document.documentElement.style.setProperty("--fundo", cor);
    try {
      localStorage.setItem(CHAVE, cor);
    } catch (e) {
      // Sem localStorage a cor vale só até recarregar.
    }
  }

  return (
    <div className={estilos.opcoesFundo}>
      {OPCOES.map((opcao) => (
        <button
          key={opcao.cor}
          type="button"
          className={`${estilos.amostraFundo} ${
            ativa === opcao.cor ? estilos.amostraAtiva : ""
          }`}
          onClick={() => escolher(opcao.cor)}
          aria-pressed={ativa === opcao.cor}
        >
          <span
            className={estilos.amostraCor}
            style={{ backgroundColor: opcao.cor }}
          />
          <span className={estilos.nomeFundo}>{opcao.nome}</span>
        </button>
      ))}
    </div>
  );
}
