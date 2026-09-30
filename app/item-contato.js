"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  criarAnotacao,
  editarAnotacao,
  excluirAnotacao,
  gerarFollowup,
  mudarEtapa,
} from "./acoes";
import estilos from "./page.module.css";

// Como cada etapa aparece na tela. Cores definidas no design.md.
const ETAPAS = {
  novo: { texto: "Novo", classe: "etapaNovo", seletor: "seletorNovo" },
  em_contato: { texto: "Em contato", classe: "etapaEmContato", seletor: "seletorEmContato" },
  proposta: { texto: "Proposta", classe: "etapaProposta", seletor: "seletorProposta" },
  cliente: { texto: "Cliente", classe: "etapaCliente", seletor: "seletorCliente" },
};

// Ordem das opções no seletor de etapa.
const OPCOES_ETAPA = [
  { valor: "novo", texto: "Novo" },
  { valor: "em_contato", texto: "Em contato" },
  { valor: "proposta", texto: "Proposta" },
  { valor: "cliente", texto: "Cliente" },
];

// Data brasileira legível. Fuso fixo para o texto ficar igual sempre.
const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function dataLegivel(iso) {
  return formatador.format(new Date(iso));
}

const estadoInicial = { ok: null, mensagem: "" };

export default function ItemContato({ contato, anotacoes }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [estado, acao, enviando] = useActionState(criarAnotacao, estadoInicial);

  // Qual anotação está em edição / aguardando confirmação de exclusão.
  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [pendente, iniciar] = useTransition();

  // Follow-up gerado pela IA.
  const [gerando, iniciarGeracao] = useTransition();
  const [followup, setFollowup] = useState(null); // { ok, mensagem }
  const [copiado, setCopiado] = useState(false);

  // Mudança de etapa (status) do contato.
  const [mudandoEtapa, iniciarMudanca] = useTransition();

  function aoMudarEtapa(evento) {
    const nova = evento.target.value;
    iniciarMudanca(async () => {
      await mudarEtapa(contato.id, nova);
    });
  }

  // Limpa o campo de nova anotação só quando ela foi mesmo salva.
  useEffect(() => {
    if (estado.ok) setTexto("");
  }, [estado]);

  function gerarFollowupAgora() {
    setCopiado(false);
    iniciarGeracao(async () => {
      const r = await gerarFollowup(contato.id);
      setFollowup(r);
    });
  }

  async function copiarFollowup() {
    try {
      await navigator.clipboard.writeText(followup.mensagem);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const etapa = ETAPAS[contato.etapa] ?? {
    texto: contato.etapa,
    classe: "etapaNovo",
  };
  const detalhes = [contato.email, contato.telefone].filter(Boolean);

  function abrirEdicao(anotacao) {
    setEditandoId(anotacao.id);
    setTextoEdicao(anotacao.texto);
    setConfirmandoId(null);
  }

  function salvarEdicao(id) {
    iniciar(async () => {
      const r = await editarAnotacao(id, textoEdicao);
      if (r?.ok) setEditandoId(null);
    });
  }

  function confirmarExclusao(id) {
    iniciar(async () => {
      const r = await excluirAnotacao(id);
      if (r?.ok) setConfirmandoId(null);
    });
  }

  return (
    <li className={estilos.item}>
      <div className={estilos.itemTopo}>
        <span className={estilos.nome}>{contato.nome}</span>
        <select
          className={`${estilos.seletorEtapa} ${estilos[etapa.seletor]}`}
          value={contato.etapa}
          onChange={aoMudarEtapa}
          disabled={mudandoEtapa}
          aria-label="Etapa do funil"
          title="Mudar etapa do funil"
        >
          {OPCOES_ETAPA.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      </div>

      <p className={estilos.detalhes}>
        {detalhes.length > 0 ? detalhes.join("  ·  ") : "Sem email e telefone"}
      </p>

      <div className={estilos.acoesContato}>
        <button
          type="button"
          className={estilos.botaoAnotacoes}
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
        >
          {aberto ? "Ocultar anotações" : `Anotações (${anotacoes.length})`}
        </button>

        <button
          type="button"
          className={estilos.botaoAnotacoes}
          onClick={gerarFollowupAgora}
          disabled={gerando}
        >
          {gerando ? "Escrevendo…" : "Gerar follow-up"}
        </button>
      </div>

      {gerando ? (
        <p className={estilos.followupEscrevendo}>A IA está escrevendo…</p>
      ) : null}

      {followup && !gerando ? (
        followup.ok ? (
          <div className={estilos.followupCartao}>
            <p className={estilos.followupTexto}>{followup.mensagem}</p>
            <div className={estilos.acoesAnotacao}>
              <button
                type="button"
                className={`${estilos.botaoMini} ${estilos.botaoCopiar}`}
                onClick={copiarFollowup}
              >
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        ) : (
          <p className={estilos.followupErro}>{followup.mensagem}</p>
        )
      ) : null}

      {aberto ? (
        <div className={estilos.painelAnotacoes}>
          {anotacoes.length === 0 ? (
            <p className={estilos.vazioAnotacoes}>Nenhuma anotação ainda.</p>
          ) : (
            <ul className={estilos.listaAnotacoes}>
              {anotacoes.map((a) => (
                <li key={a.id} className={estilos.anotacao}>
                  <time className={estilos.dataAnotacao} dateTime={a.criado_em}>
                    {dataLegivel(a.criado_em)}
                  </time>

                  {editandoId === a.id ? (
                    <>
                      <textarea
                        className={estilos.campoAnotacao}
                        rows={3}
                        value={textoEdicao}
                        onChange={(e) => setTextoEdicao(e.target.value)}
                      />
                      <div className={estilos.acoesAnotacao}>
                        <button
                          type="button"
                          className={`${estilos.botaoMini} ${estilos.botaoEditar}`}
                          disabled={pendente || textoEdicao.trim() === ""}
                          onClick={() => salvarEdicao(a.id)}
                        >
                          {pendente ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          type="button"
                          className={estilos.botaoMini}
                          disabled={pendente}
                          onClick={() => setEditandoId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={estilos.textoAnotacao}>{a.texto}</p>

                      {confirmandoId === a.id ? (
                        <div className={estilos.acoesAnotacao}>
                          <span className={estilos.perguntaExclusao}>
                            Excluir esta anotação?
                          </span>
                          <button
                            type="button"
                            className={`${estilos.botaoMini} ${estilos.botaoConfirmar}`}
                            disabled={pendente}
                            onClick={() => confirmarExclusao(a.id)}
                          >
                            {pendente ? "Excluindo..." : "Confirmar"}
                          </button>
                          <button
                            type="button"
                            className={estilos.botaoMini}
                            disabled={pendente}
                            onClick={() => setConfirmandoId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className={estilos.acoesAnotacao}>
                          <button
                            type="button"
                            className={`${estilos.botaoMini} ${estilos.botaoEditar}`}
                            onClick={() => abrirEdicao(a)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`${estilos.botaoMini} ${estilos.botaoExcluir}`}
                            onClick={() => {
                              setConfirmandoId(a.id);
                              setEditandoId(null);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form action={acao} className={estilos.formAnotacao}>
            <input type="hidden" name="contato_id" value={contato.id} />
            <textarea
              className={estilos.campoAnotacao}
              name="texto"
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva uma anotação sobre este contato..."
            />
            <div className={estilos.rodapeAnotacao}>
              <button className={estilos.botao} type="submit" disabled={enviando}>
                {enviando ? "Salvando..." : "Salvar anotação"}
              </button>
              {estado.mensagem && !estado.ok ? (
                <p
                  className={estilos.avisoErro}
                  role="status"
                  aria-live="polite"
                >
                  {estado.mensagem}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </li>
  );
}
