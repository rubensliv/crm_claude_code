"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "../lib/supabase";
import { gerarMensagemFollowup } from "../lib/ia";
import { conferirSenha, gerarHashSenha } from "../lib/auth";
import {
  criarSessao,
  encerrarSessao,
  exigirSessao,
  exigirAdmin,
} from "../lib/sessao";
import {
  buscarUsuario,
  criarUsuario,
  criarUsuarioAprovado,
  aprovarUsuario,
} from "../lib/usuarios";

// Entra no sistema. Confere usuário e senha no banco; só entra quem foi aprovado.
export async function entrar(estadoAnterior, dadosDoFormulario) {
  const usuario = String(dadosDoFormulario.get("usuario") ?? "").trim();
  const senha = String(dadosDoFormulario.get("senha") ?? "");

  const registro = await buscarUsuario(usuario);
  if (!registro || !conferirSenha(senha, registro.senha_hash)) {
    return { ok: false, mensagem: "Usuário ou senha inválidos." };
  }

  if (registro.status !== "aprovado") {
    return {
      ok: false,
      mensagem: "Seu cadastro está aguardando aprovação do administrador.",
    };
  }

  await criarSessao(registro.usuario, registro.role);
  redirect("/");
}

// Cadastra um novo usuário. Ele nasce pendente e não entra até ser aprovado.
export async function registrar(estadoAnterior, dadosDoFormulario) {
  const usuario = String(dadosDoFormulario.get("usuario") ?? "").trim();
  const senha = String(dadosDoFormulario.get("senha") ?? "");
  const senha2 = String(dadosDoFormulario.get("senha2") ?? "");

  if (usuario.length < 3) {
    return { ok: false, mensagem: "O usuário precisa de ao menos 3 caracteres." };
  }
  if (senha.length < 6) {
    return { ok: false, mensagem: "A senha precisa de ao menos 6 caracteres." };
  }
  if (senha !== senha2) {
    return { ok: false, mensagem: "As senhas digitadas não são iguais." };
  }

  if (await buscarUsuario(usuario)) {
    return { ok: false, mensagem: "Esse usuário já existe. Escolha outro." };
  }

  const { error } = await criarUsuario(usuario, gerarHashSenha(senha));
  if (error) {
    console.error("Falha ao cadastrar usuário:", error);
    return { ok: false, mensagem: "Não foi possível cadastrar agora. Tente de novo." };
  }

  return {
    ok: true,
    mensagem:
      "Cadastro enviado! Aguarde a aprovação do administrador para entrar.",
  };
}

// Cria um usuário direto, já aprovado. Só o admin pode.
export async function criarUsuarioPeloAdmin(estadoAnterior, dadosDoFormulario) {
  await exigirAdmin();

  const usuario = String(dadosDoFormulario.get("usuario") ?? "").trim();
  const senha = String(dadosDoFormulario.get("senha") ?? "");
  const senha2 = String(dadosDoFormulario.get("senha2") ?? "");
  const role = String(dadosDoFormulario.get("role") ?? "user");

  if (usuario.length < 3) {
    return { ok: false, mensagem: "O usuário precisa de ao menos 3 caracteres." };
  }
  if (senha.length < 6) {
    return { ok: false, mensagem: "A senha precisa de ao menos 6 caracteres." };
  }
  if (senha !== senha2) {
    return { ok: false, mensagem: "As senhas digitadas não são iguais." };
  }
  if (role !== "user" && role !== "admin") {
    return { ok: false, mensagem: "Papel inválido." };
  }
  if (await buscarUsuario(usuario)) {
    return { ok: false, mensagem: "Esse usuário já existe. Escolha outro." };
  }

  const { error } = await criarUsuarioAprovado(usuario, gerarHashSenha(senha), role);
  if (error) {
    console.error("Falha ao criar usuário (admin):", error);
    return { ok: false, mensagem: "Não foi possível criar o usuário agora. Tente de novo." };
  }

  revalidatePath("/usuarios");
  return { ok: true, mensagem: `Usuário "${usuario}" criado e já aprovado.` };
}

// Aprova um usuário pendente. Só o admin pode.
export async function aprovar(id) {
  await exigirAdmin();

  const { error } = await aprovarUsuario(Number(id));
  if (error) {
    console.error("Falha ao aprovar usuário:", error);
    return { ok: false, mensagem: "Não foi possível aprovar agora. Tente de novo." };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

// Gera um follow-up com a IA para um contato. Só para quem está logado.
export async function gerarFollowup(contatoId) {
  await exigirSessao();

  const id = Number(contatoId);
  if (!id) return { ok: false, mensagem: "Contato inválido." };

  // Busca o contato e as anotações dele no banco.
  const { data: contato, error: erroContato } = await supabase
    .from("contatos")
    .select("nome, etapa")
    .eq("id", id)
    .maybeSingle();

  if (erroContato || !contato) {
    return { ok: false, mensagem: "Não encontrei esse contato." };
  }

  const { data: anotacoes } = await supabase
    .from("anotacoes")
    .select("texto")
    .eq("contato_id", id)
    .order("criado_em", { ascending: true });

  try {
    const mensagem = await gerarMensagemFollowup({
      nome: contato.nome,
      etapa: contato.etapa,
      anotacoes: (anotacoes ?? []).map((a) => a.texto),
    });
    return { ok: true, mensagem };
  } catch (erro) {
    // Detalhe técnico fica no log do servidor, não na tela do usuário.
    console.error("Falha ao gerar follow-up:", erro);
    return {
      ok: false,
      mensagem: "Não consegui gerar o follow-up agora. Tente de novo em instantes.",
    };
  }
}

// Muda a etapa (status) de um contato no funil. Só para quem está logado.
export async function mudarEtapa(contatoId, novaEtapa) {
  await exigirSessao();

  const id = Number(contatoId);
  const ETAPAS_VALIDAS = ["novo", "em_contato", "proposta", "cliente"];
  if (!id || !ETAPAS_VALIDAS.includes(novaEtapa)) {
    return { ok: false, mensagem: "Etapa inválida." };
  }

  const { error } = await supabase
    .from("contatos")
    .update({ etapa: novaEtapa })
    .eq("id", id);

  if (error) {
    console.error("Falha ao mudar etapa:", error);
    return { ok: false, mensagem: "Não foi possível mudar a etapa agora. Tente de novo." };
  }

  // Atualiza a lista e o painel do funil na hora, sem recarregar.
  revalidatePath("/");
  return { ok: true };
}

// Sai do sistema: apaga a sessão e volta para o login.
export async function sair() {
  await encerrarSessao();
  redirect("/login");
}

// Aceita telefone brasileiro: fixo com 10 digitos ou celular com 11.
// Devolve o numero no formato padrao, ou null se nao for valido.
function padronizarTelefone(bruto) {
  const digitos = bruto.replace(/\D/g, "");

  // DDD nao comeca com zero.
  if (digitos.startsWith("0")) return null;

  // Fixo: (XX) XXXX-XXXX
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  // Celular: (XX) XXXXX-XXXX — o numero sempre comeca com 9.
  if (digitos.length === 11 && digitos[2] === "9") {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }

  return null;
}

// Roda no servidor. O navegador nunca vê a chave secreta nem fala com o banco.
export async function criarContato(estadoAnterior, dadosDoFormulario) {
  await exigirSessao();

  const nome = String(dadosDoFormulario.get("nome") ?? "").trim();
  const email = String(dadosDoFormulario.get("email") ?? "").trim();
  const telefone = String(dadosDoFormulario.get("telefone") ?? "").trim();

  if (!nome) {
    return {
      ok: false,
      mensagem: "O nome é obrigatório. Preencha o nome para salvar o contato.",
    };
  }

  // Precisa de pelo menos uma forma de contato.
  if (!email && !telefone) {
    return {
      ok: false,
      mensagem:
        "Informe pelo menos uma forma de contato: email ou telefone.",
    };
  }

  // O telefone é conferido só quando vem preenchido.
  let telefonePadronizado = null;
  if (telefone) {
    telefonePadronizado = padronizarTelefone(telefone);

    if (!telefonePadronizado) {
      return {
        ok: false,
        mensagem:
          "Telefone fora do formato brasileiro. Use (11) 98877-1234 para celular ou (11) 3877-1234 para fixo.",
      };
    }
  }

  // A etapa não é enviada: o banco preenche com "novo" sozinho.
  const { error } = await supabase.from("contatos").insert({
    nome,
    email: email || null,
    telefone: telefonePadronizado,
  });

  if (error) {
    console.error("Falha ao salvar contato:", error);
    return { ok: false, mensagem: "Não foi possível salvar o contato agora. Tente de novo." };
  }

  // Manda o Next.js buscar a lista de novo e redesenhar a tela, sem recarregar.
  revalidatePath("/");

  return { ok: true, mensagem: `Contato "${nome}" salvo.` };
}

// Grava uma anotação ligada a um contato. Roda no servidor.
export async function criarAnotacao(estadoAnterior, dadosDoFormulario) {
  await exigirSessao();

  const contatoId = Number(dadosDoFormulario.get("contato_id"));
  const texto = String(dadosDoFormulario.get("texto") ?? "").trim();

  if (!contatoId) {
    return { ok: false, mensagem: "Contato inválido." };
  }
  if (!texto) {
    return { ok: false, mensagem: "Escreva algo antes de salvar a anotação." };
  }

  // A data é preenchida pelo banco (criado_em default now()).
  const { error } = await supabase
    .from("anotacoes")
    .insert({ contato_id: contatoId, texto });

  if (error) {
    console.error("Falha ao salvar anotação:", error);
    return { ok: false, mensagem: "Não foi possível salvar a anotação agora. Tente de novo." };
  }

  revalidatePath("/");

  return { ok: true, mensagem: "Anotação salva." };
}

// Altera o texto de uma anotação. Roda no servidor.
export async function editarAnotacao(id, texto) {
  await exigirSessao();

  const idNum = Number(id);
  const textoLimpo = String(texto ?? "").trim();

  if (!idNum) return { ok: false, mensagem: "Anotação inválida." };
  if (!textoLimpo) {
    return { ok: false, mensagem: "A anotação não pode ficar vazia." };
  }

  const { error } = await supabase
    .from("anotacoes")
    .update({ texto: textoLimpo })
    .eq("id", idNum);

  if (error) {
    console.error("Falha ao editar anotação:", error);
    return { ok: false, mensagem: "Não foi possível editar a anotação agora. Tente de novo." };
  }

  revalidatePath("/");

  return { ok: true };
}

// Apaga uma anotação. Não tem desfazer. Roda no servidor.
export async function excluirAnotacao(id) {
  await exigirSessao();

  const idNum = Number(id);
  if (!idNum) return { ok: false, mensagem: "Anotação inválida." };

  const { error } = await supabase
    .from("anotacoes")
    .delete()
    .eq("id", idNum);

  if (error) {
    console.error("Falha ao excluir anotação:", error);
    return { ok: false, mensagem: "Não foi possível excluir a anotação agora. Tente de novo." };
  }

  revalidatePath("/");

  return { ok: true };
}
