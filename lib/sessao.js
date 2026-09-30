import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESSAO,
  DURACAO_SESSAO_MS,
  criarValorSessao,
  lerValorSessao,
} from "./auth";

// Grava o cookie de sessão com quem entrou e seu papel. Só o servidor faz isso.
export async function criarSessao(usuario, role) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSAO, criarValorSessao(usuario, role), {
    httpOnly: true, // o JavaScript do navegador não enxerga o cookie
    secure: process.env.NODE_ENV === "production", // https em produção
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(DURACAO_SESSAO_MS / 1000),
  });
}

// Apaga o cookie de sessão (logout).
export async function encerrarSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSAO);
}

// Retorna { usuario, role } se houver sessão válida; senão null.
export async function lerSessao() {
  const cookieStore = await cookies();
  return lerValorSessao(cookieStore.get(COOKIE_SESSAO)?.value);
}

// Exige sessão. Sem ela, manda para o login. Devolve { usuario, role }.
export async function exigirSessao() {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }
  return sessao;
}

// Exige sessão de administrador. Sem login → login; sem ser admin → home.
export async function exigirAdmin() {
  const sessao = await exigirSessao();
  if (sessao.role !== "admin") {
    redirect("/");
  }
  return sessao;
}
