import { supabase } from "../lib/supabase";
import { exigirSessao } from "../lib/sessao";
import Navbar from "./navbar";
import PainelFunil from "./painel-funil";
import FormularioContato from "./formulario-contato";
import ItemContato from "./item-contato";
import ConfiguracoesFundo from "./configuracoes-fundo";
import estilos from "./page.module.css";

// Sempre buscar do banco, nunca servir uma versão guardada.
export const dynamic = "force-dynamic";

export default async function Home() {
  // Sem sessão, ninguém vê nada: cai no login antes de buscar os dados.
  const sessao = await exigirSessao();

  const { data: contatos, error } = await supabase
    .from("contatos")
    .select("*")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  if (error) console.error("Falha ao carregar contatos:", error);

  // Busca todas as anotações de uma vez e agrupa por contato.
  const { data: anotacoes } = await supabase
    .from("anotacoes")
    .select("*")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  const anotacoesPorContato = {};
  for (const anotacao of anotacoes ?? []) {
    (anotacoesPorContato[anotacao.contato_id] ??= []).push(anotacao);
  }

  return (
    <>
      <Navbar sessao={sessao} atual="contatos" />
      <main className={estilos.pagina}>
        <div className={estilos.conteudo}>
          <header>
            <h1 className={estilos.titulo}>Meu CRM</h1>
            <p className={estilos.apoio}>
              Contatos e oportunidades de negócio em um só lugar.
            </p>
          </header>

        <PainelFunil contatos={contatos ?? []} />

        <section className={estilos.cartao}>
          <h2 className={estilos.subtitulo}>Novo contato</h2>
          <FormularioContato />
        </section>

        <section className={estilos.cartao}>
          <h2 className={estilos.subtitulo}>
            Contatos
            {contatos?.length ? (
              <span className={estilos.contagem}>{contatos.length}</span>
            ) : null}
          </h2>

          {error ? (
            <p className={estilos.vazio}>
              Não foi possível carregar os contatos agora. Recarregue a página.
            </p>
          ) : contatos.length === 0 ? (
            <p className={estilos.vazio}>Nenhum contato cadastrado ainda.</p>
          ) : (
            <ul className={estilos.lista}>
              {contatos.map((contato) => (
                <ItemContato
                  key={contato.id}
                  contato={contato}
                  anotacoes={anotacoesPorContato[contato.id] ?? []}
                />
              ))}
            </ul>
          )}
        </section>

        <section className={estilos.cartao}>
          <h2 className={estilos.subtitulo}>Configurações</h2>
          <p className={estilos.rotuloConfig}>Fundo da página</p>
          <ConfiguracoesFundo />
        </section>
        </div>
      </main>
    </>
  );
}
