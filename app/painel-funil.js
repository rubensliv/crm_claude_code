import estilos from "./page.module.css";

// Cada etapa com o rótulo e a classe da sua cor (cores no design.md).
const ETAPAS = [
  { chave: "novo", texto: "Novo", classe: "painelNumeroNovo" },
  { chave: "em_contato", texto: "Em contato", classe: "painelNumeroEmContato" },
  { chave: "proposta", texto: "Proposta", classe: "painelNumeroProposta" },
  { chave: "cliente", texto: "Cliente", classe: "painelNumeroCliente" },
];

// Painel do funil: total de contatos + contagem por etapa. Recebe os
// contatos já buscados do banco e conta na hora — sem estado próprio,
// então acompanha qualquer mudança que recarregue a home.
export default function PainelFunil({ contatos }) {
  const total = contatos.length;

  return (
    <section className={estilos.painel}>
      <div className={estilos.painelItem}>
        <span className={`${estilos.painelNumero} ${estilos.painelNumeroTotal}`}>
          {total}
        </span>
        <span className={estilos.painelRotulo}>Contatos no total</span>
      </div>

      {ETAPAS.map((etapa) => (
        <div key={etapa.chave} className={estilos.painelItem}>
          <span className={`${estilos.painelNumero} ${estilos[etapa.classe]}`}>
            {contatos.filter((c) => c.etapa === etapa.chave).length}
          </span>
          <span className={estilos.painelRotulo}>{etapa.texto}</span>
        </div>
      ))}
    </section>
  );
}
