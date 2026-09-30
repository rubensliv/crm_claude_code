// Redefine a senha de um usuário do CRM, direto na tabela "usuarios".
// A senha não aparece na tela e não sai da sua máquina.
// Rode com:  node --env-file=.env.local redefinir-senha.mjs
import crypto from "node:crypto";
import readline from "node:readline";

function perguntar(texto, oculto = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (oculto) {
      rl._writeToOutput = (s) => {
        if (s.includes(texto)) rl.output.write(texto);
      };
    }
    rl.question(texto, (resposta) => {
      rl.close();
      if (oculto) process.stdout.write("\n");
      resolve(resposta.trim());
    });
  });
}

// Mesma lógica de embaralhar do lib/auth.js (sal + scrypt).
function gerarHashSenha(senha) {
  const sal = crypto.randomBytes(16);
  const derivada = crypto.scryptSync(senha, sal, 64);
  return `${sal.toString("hex")}:${derivada.toString("hex")}`;
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.log("Faltam SUPABASE_URL / SUPABASE_SECRET_KEY. Rode com: node --env-file=.env.local redefinir-senha.mjs");
  process.exit(1);
}

const usuario = await perguntar("Usuário (ex.: rubens): ");
const senha = await perguntar("Nova senha (não aparece na tela): ", true);
const senha2 = await perguntar("Repita a nova senha: ", true);

if (!usuario || senha.length < 6) {
  console.log("\nUsuário vazio ou senha com menos de 6 caracteres. Rode de novo.");
  process.exit(1);
}
if (senha !== senha2) {
  console.log("\nAs senhas não bateram. Rode de novo.");
  process.exit(1);
}

const hash = gerarHashSenha(senha);
const h = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const resposta = await fetch(
  `${url}/rest/v1/usuarios?usuario=eq.${encodeURIComponent(usuario)}`,
  { method: "PATCH", headers: h, body: JSON.stringify({ senha_hash: hash }) }
);
const dados = await resposta.json();

if (resposta.ok && Array.isArray(dados) && dados.length > 0) {
  console.log(`\nSenha redefinida para o usuário "${usuario}". Já pode entrar com a nova senha.`);
} else if (resposta.ok) {
  console.log(`\nNenhum usuário chamado "${usuario}" foi encontrado. Confira o nome e rode de novo.`);
} else {
  console.log("\nNão foi possível redefinir:", JSON.stringify(dados).slice(0, 200));
}
