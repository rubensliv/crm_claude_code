import { supabase } from "./supabase";

// Busca um usuário pelo nome. Retorna o registro ou null.
export async function buscarUsuario(usuario) {
  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("usuario", usuario)
    .maybeSingle();
  return data ?? null;
}

// Cria um usuário novo. Papel e situação usam o padrão do banco:
// role = "user", status = "pendente".
export async function criarUsuario(usuario, senhaHash) {
  return supabase.from("usuarios").insert({ usuario, senha_hash: senhaHash });
}

// Cria um usuário já aprovado, com o papel escolhido. Uso do admin,
// que cria a conta de propósito (não precisa passar por aprovação).
export async function criarUsuarioAprovado(usuario, senhaHash, role) {
  return supabase
    .from("usuarios")
    .insert({ usuario, senha_hash: senhaHash, role, status: "aprovado" });
}

// Lista todos os usuários (sem a senha), pendentes primeiro.
export async function listarUsuarios() {
  const { data } = await supabase
    .from("usuarios")
    .select("id, usuario, role, status, criado_em")
    .order("status", { ascending: true }) // "aprovado" < "pendente"? não: ordenamos abaixo
    .order("id", { ascending: true });

  const lista = data ?? [];
  // Pendentes no topo (é o que o admin precisa agir).
  return lista.sort((a, b) => {
    if (a.status === b.status) return a.id - b.id;
    return a.status === "pendente" ? -1 : 1;
  });
}

// Aprova um usuário pendente.
export async function aprovarUsuario(id) {
  return supabase.from("usuarios").update({ status: "aprovado" }).eq("id", id);
}
