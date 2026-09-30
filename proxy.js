import { NextResponse } from "next/server";
import { COOKIE_SESSAO, lerValorSessao } from "./lib/auth";

// Checagem rápida em toda navegação (no Next 16 isto se chama "proxy",
// era o antigo "middleware"). Sem sessão, tudo cai no login.
// A checagem de verdade acontece também na página e nas ações.
const ROTAS_PUBLICAS = ["/login", "/register"];

export function proxy(request) {
  const caminho = request.nextUrl.pathname;
  const logado = Boolean(
    lerValorSessao(request.cookies.get(COOKIE_SESSAO)?.value)
  );
  const ehPublica = ROTAS_PUBLICAS.includes(caminho);

  // Sem sessão em rota protegida → login.
  if (!logado && !ehPublica) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Já logado tentando ver o login → manda para o CRM.
  if (logado && ehPublica) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

// Não roda em arquivos internos do Next nem em imagens.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)"],
};
