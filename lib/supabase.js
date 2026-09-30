import { createClient } from "@supabase/supabase-js";

// Lidos do .env.local. Como os nomes NÃO começam com NEXT_PUBLIC_,
// o Next.js só entrega esses valores ao servidor — no navegador eles não existem.
const url = process.env.SUPABASE_URL;
const chaveSecreta = process.env.SUPABASE_SECRET_KEY;

if (!url || !chaveSecreta) {
  throw new Error(
    "Faltam SUPABASE_URL e/ou SUPABASE_SECRET_KEY no arquivo .env.local"
  );
}

// Conexão com o banco. Usa a chave secreta, então este arquivo só pode ser
// importado por código de servidor. Nunca importe em componente de navegador.
export const supabase = createClient(url, chaveSecreta, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
