# PRD — CRM

## O que é e pra quem

O CRM é um sistema web para organizar contatos e oportunidades de negócio em um só lugar. É para um profissional autônomo ou um time pequeno que hoje controla clientes espalhados entre planilha, WhatsApp e memória, e acaba perdendo negócio por falta de acompanhamento. O objetivo é responder três perguntas a qualquer momento: quem são meus contatos, em que etapa cada negócio está e o que eu preciso fazer a seguir.

## Primeira versão

- [x] **Cadastro e listagem de contatos** — criar e listar contatos. Editar e remover ficaram de fora e ainda não têm etapa definida.
- [x] **Funil com etapas** — cada contato tem um seletor de etapa (novo, em contato, proposta, cliente) na cor da etapa; ao trocar, salva no banco e o painel do funil atualiza na hora.
- [x] **Anotações por contato** — registrar o histórico da conversa em texto livre, com data. Cada contato abre um painel para ler as anotações antigas e escrever novas.
- [x] **Login e usuários** — cadastro público (register); novos usuários nascem **pendentes** e só entram após aprovação. Papéis `admin` e `user`; só o admin aprova e vê a área de Usuários. Sem login, ninguém vê nada. Senhas embaralhadas na tabela `usuarios`; sessão por cookie assinado; navbar com as páginas internas e botão "Sair". (Escopo ampliado em 2026-09-11 — antes era conta única.)
- [x] **Follow-up gerado por IA** — botão "Gerar follow-up" em cada contato; a IA (Google Gemini, modelo gemini-2.5-flash) escreve uma mensagem curta a partir do nome, da etapa e das anotações. Mensagem aparece pronta com botão "Copiar". Chamada feita no back-end (a chave nunca vai ao navegador).
- [x] **Painel com os números do funil** — no topo da home: total de contatos e a contagem de cada etapa (novo, em contato, proposta, cliente), cada número na cor da sua etapa. Recalcula do banco a cada carga e a cada cadastro.
- [ ] **Publicação na internet** — o sistema no ar, acessível por um endereço próprio.

## O que NÃO entra na primeira versão

Fora do escopo por enquanto — não é "nunca", é "agora não":

- Recuperação de senha por e-mail. (Cadastro público e níveis de permissão passaram a entrar em 2026-09-11.)
- Times/organizações e permissões além de `admin`/`user` (ex.: papéis por área, times separados).
- Etapas do funil personalizáveis. As quatro etapas são fixas.
- Campos personalizados no contato. Os campos são fixos.
- Valor em R$ por oportunidade, previsão de receita e metas.
- Integrações com e-mail, WhatsApp, calendário ou qualquer serviço externo.
- Importação e exportação em massa (CSV, planilha).
- Envio automático de mensagens. A IA sugere o texto; quem envia é o usuário, por fora.
- Notificações, lembretes e alertas (e-mail, push).
- Aplicativo mobile. É um site que funciona no celular, e só.
- Relatórios avançados, gráficos customizáveis e filtros complexos.
- Histórico de alterações e log de auditoria.
