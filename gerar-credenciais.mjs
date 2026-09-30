// Gera as 3 linhas de login para o .env.local, sem que a senha saia da sua máquina.
// Rode com:  node gerar-credenciais.mjs
import crypto from "node:crypto";
import readline from "node:readline";

function perguntar(texto, oculto = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (oculto) {
      rl._writeToOutput = (s) => {
        // Escreve a pergunta uma vez; esconde o que for digitado depois.
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

const usuario = await perguntar("Usuário: ");
const senha = await perguntar("Senha (não aparece na tela): ", true);
const senha2 = await perguntar("Repita a senha: ", true);

if (!usuario || !senha) {
  console.log("\nUsuário e senha não podem ficar vazios. Rode de novo.");
  process.exit(1);
}
if (senha !== senha2) {
  console.log("\nAs senhas não bateram. Rode de novo.");
  process.exit(1);
}

const hash = gerarHashSenha(senha);
const segredo = crypto.randomBytes(32).toString("base64url");

console.log("\n" + "=".repeat(60));
console.log("Cole estas 3 linhas no arquivo .env.local (troque as antigas):\n");
console.log(`AUTH_USUARIO=${usuario}`);
console.log(`AUTH_SENHA_HASH=${hash}`);
console.log(`AUTH_SECRET=${segredo}`);
console.log("\n" + "=".repeat(60));
console.log("Depois de salvar, reinicie o servidor (pare com Ctrl+C e rode npm run dev).");
