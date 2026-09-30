import crypto from "node:crypto";

// Nome do cookie de sessão e por quanto tempo ele vale.
export const COOKIE_SESSAO = "crm_sessao";
export const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

// ---------- Senha ----------
// Embaralha a senha com scrypt e um "sal" aleatório. Guardamos "sal:hash".
// O mesmo texto gera hashes diferentes por causa do sal — e não dá para
// voltar do hash para a senha.
export function gerarHashSenha(senha) {
  const sal = crypto.randomBytes(16);
  const derivada = crypto.scryptSync(senha, sal, 64);
  return `${sal.toString("hex")}:${derivada.toString("hex")}`;
}

// Confere a senha digitada contra o "sal:hash" guardado, em tempo constante.
export function conferirSenha(senha, hashArmazenado) {
  if (!hashArmazenado || !hashArmazenado.includes(":")) return false;

  const [salHex, derivadaHex] = hashArmazenado.split(":");
  const sal = Buffer.from(salHex, "hex");
  const esperada = Buffer.from(derivadaHex, "hex");
  if (esperada.length === 0) return false;

  const derivada = crypto.scryptSync(senha, sal, esperada.length);
  return (
    derivada.length === esperada.length &&
    crypto.timingSafeEqual(derivada, esperada)
  );
}

// ---------- Sessão ----------
// A sessão é um texto assinado com um segredo do servidor (HMAC).
// Guarda quem está logado (usuário) e o seu papel (role). O navegador
// guarda o texto, mas não consegue forjá-lo sem o segredo.
function assinar(corpo) {
  const segredo = process.env.AUTH_SECRET;
  return crypto.createHmac("sha256", segredo).update(corpo).digest("hex");
}

export function criarValorSessao(usuario, role) {
  const payload = {
    u: usuario,
    role,
    exp: Date.now() + DURACAO_SESSAO_MS,
  };
  const corpo = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${corpo}.${assinar(corpo)}`;
}

// Valida o texto da sessão. Retorna { usuario, role } se for válido e não
// estiver vencido; senão retorna null.
export function lerValorSessao(valor) {
  if (!valor || !process.env.AUTH_SECRET) return null;

  const partes = valor.split(".");
  if (partes.length !== 2) return null;

  const [corpo, assinatura] = partes;
  const esperada = assinar(corpo);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(corpo, "base64url").toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return { usuario: payload.u, role: payload.role };
  } catch {
    return null;
  }
}
