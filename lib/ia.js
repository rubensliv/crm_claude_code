import { GoogleGenAI } from "@google/genai";

// Modelo Gemini rápido e barato, adequado para uma mensagem curta.
const MODELO = "gemini-3.6-flash";

// Nome legível de cada etapa, para a IA entender o contexto.
const ETAPAS = {
  novo: "Novo (primeiro contato, ainda não conversamos)",
  em_contato: "Em contato (conversa em andamento)",
  proposta: "Proposta (proposta enviada, aguardando decisão)",
  cliente: "Cliente (já fechou negócio)",
};

// Escreve uma mensagem de follow-up para um contato, com a API do Gemini.
// Roda só no servidor. Lança erro se a chamada falhar (quem chama trata).
export async function gerarMensagemFollowup({ nome, etapa, anotacoes }) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new Error("GEMINI_API_KEY não configurada no .env.local");
  }

  const ai = new GoogleGenAI({ apiKey: chave });

  const etapaTexto = ETAPAS[etapa] ?? etapa;
  const historico =
    anotacoes.length > 0
      ? anotacoes.map((a, i) => `${i + 1}. ${a}`).join("\n")
      : "(sem anotações registradas)";

  const instrucoes = [
    "Você escreve mensagens de follow-up para um CRM.",
    "Escreva UMA mensagem curta (2 a 4 frases), natural e pronta para enviar ao contato.",
    "Tom: profissional, caloroso e direto. Idioma: português do Brasil.",
    "Use o nome, a etapa do funil e as anotações para dar contexto e sugerir o próximo passo.",
    "Responda apenas com o texto da mensagem — sem aspas, sem saudações genéricas de IA, sem explicar o que você fez.",
  ].join(" ");

  const dados = [
    `Contato: ${nome}`,
    `Etapa do funil: ${etapaTexto}`,
    `Anotações (histórico do relacionamento):`,
    historico,
  ].join("\n");

  const resposta = await ai.models.generateContent({
    model: MODELO,
    contents: dados,
    config: {
      systemInstruction: instrucoes,
      temperature: 0.7,
      // Teto alto: o Gemini 3.x "pensa" antes de responder, e esse raciocínio
      // consome tokens. Espaço de sobra evita cortar a mensagem no meio.
      maxOutputTokens: 2000,
    },
  });

  const texto = resposta.text?.trim();
  if (!texto) {
    throw new Error("O Gemini respondeu vazio.");
  }
  return texto;
}
