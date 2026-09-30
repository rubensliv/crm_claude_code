# Regras do projeto

Manual que o Claude lê no início de toda sessão. Vale para tudo neste repositório.

1. **`prd.md` e `design.md` são a fonte da verdade.** Consulte os dois antes de qualquer tarefa. Se o que foi pedido conflita com eles, avise antes de codar.

2. **Prioridade máxima é simplicidade.** A solução mais simples que resolve o problema. Sem camada de abstração, biblioteca ou padrão que não seja necessário agora.

3. **Next.js como base.** Telas e servidor no mesmo projeto, do jeito que o mercado constrói hoje. Não introduzir outro framework.

4. **Explicações sempre em português direto**, sem jargão desnecessário.

5. **Nenhuma senha ou chave dentro do código.** Segredos ficam em arquivo próprio (`.env.local`), que nunca vai para o repositório.

6. **Somente o que foi pedido em cada etapa.** Nada de funcionalidade, arquivo ou "melhoria" por conta própria. Se notar algo que vale a pena, sugira — não faça.

7. **Antes de mudanças grandes, explicar em 2 frases** o que vai ser feito, e esperar o ok.

8. **Toda entrega termina com "como testar"** — um comando ou passo concreto para conferir o resultado.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
