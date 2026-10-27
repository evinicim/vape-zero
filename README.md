# VAPE ZERO — MVP

> Informação para escolher. Apoio para mudar.

Plataforma de prevenção e apoio para parar com o vape, para adolescentes (13–17), escolas e serviços de saúde. Fonte da verdade: `../PRODUCT_BRIEF.md`.

## Rodar localmente (sem credenciais externas)

```bash
cd /workspace/vape-zero/app
npm install
cp .env.example .env.local   # opcional
npm run seed                  # (re)cria a base demo
npm run dev                   # http://localhost:3000
npm run build && npm start    # produção
```

### Contas demo (senha `demo1234`)
| Papel | E-mail | Entrada |
|---|---|---|
| Aluno | aluno@demo.com | /entrar |
| Gestor (educador) | gestor@demo.com | /gestor/entrar → /painel |
| Admin de conteúdo | admin@demo.com | /gestor/entrar → /admin |

Novo aluno: `/cadastro` com código de turma `8A2026` (ou `9B2026`, `1EM2026`).

## Rotas
- `/` landing (problema, como funciona, planos estimados, form "Solicitar demonstração" → grava lead)
- `/aluno` situações, progresso e trilha sugerida · `/aluno/situacao/[slug]` texto + ilustração → escolha → feedback → próximo passo (pessoa de confiança / UBS / Disque 136) → trilha
- `/painel` agregados por turma, k-anonimato n≥10 (turma piloto com 6 alunos aparece oculta), gráficos Recharts; admin vê leads
- `/admin` CRUD de situações (até 3 escolhas, trilha e próximo passo por escolha)
- `/legal/aviso`, `/legal/termos`, `/legal/privacidade`

## Arquitetura
- Next.js 15 App Router + TypeScript + Tailwind v4 + shadcn/ui (tema calmo em `src/app/globals.css`)
- Dados: `src/lib/db.ts` — base JSON local (`data/db.json`), seed em `src/lib/seed.ts`. Mutations via Server Actions (`src/app/actions.ts`).
- Auth demo: cookie httpOnly assinado com HMAC (`src/lib/auth.ts`), senhas com scrypt.
- Supabase pronto para troca: `supabase/migrations/0001_init.sql` (tabelas organization, class, member, situation, scenario_step, choice, response, trail, lead + RLS + RPCs agregadas com k-anonimato) e `supabase/seed.sql`.

### Migrar para Supabase
1. `supabase link` e `supabase db push` (região São Paulo — sa-east-1).
2. Preencher `.env.local` com as chaves.
3. Substituir `readDB/mutate` por chamadas `@supabase/ssr` e `getUser/setSession` por Supabase Auth (e-mail/senha ou magic link). O painel deve usar as RPCs `class_stats`/`choice_stats`.

## O que falta (próximos passos)
- Integração real Supabase (cliente, Auth, Storage para ilustrações)
- Situações com múltiplos passos (schema já suporta `scenario_step`)
- PWA completo (service worker/offline, ícones)
- Testes Playwright do fluxo aluno; revisão jurídica dos textos legais
- Ilustrações finais (atuais são SVG placeholders)

## Checklist de acessibilidade / Lighthouse
- [ ] `npx lighthouse http://localhost:3000 --view` (meta ≥ 90 em A11y/Best Practices)
- [ ] `npx @axe-core/cli http://localhost:3000/entrar`
- [x] `lang="pt-BR"`, labels em todos os campos, `role=alert` em erros, `aria-live` no feedback
- [ ] Contraste verificado no tema final

## Supabase (dados em produção)

Projeto Supabase: `vape-zero` (região sa-east-1). Schema em `supabase/migrations/0001_init.sql`; conteúdo base em `supabase/seed.sql` + `supabase/seed_steps.sql` (passos e escolhas gerados de `src/lib/seed.ts`, idempotente).

### Variáveis de ambiente (`.env.local` / Vercel)
| Variável | Onde | Uso |
|---|---|---|
| `SESSION_SECRET` | servidor | assina o cookie de sessão demo |
| `NEXT_PUBLIC_SUPABASE_URL` | público | liga o modo Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | público | cliente com RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** (opcional) | `src/lib/supabase/admin.ts`; nunca expor ao cliente |

### Como funciona hoje
- **Com `NEXT_PUBLIC_SUPABASE_URL` + chave pública + `SUPABASE_SERVICE_ROLE_KEY`** (produção):
  - **Auth:** Supabase Auth com sessão em cookies `sb-*` (`@supabase/ssr`); `src/middleware.ts` renova a sessão. Perfil/papel vem da tabela `member`.
  - Cadastro de aluno: cria usuário no Auth (service role, e-mail já confirmado) + `member` na turma do código.
  - **Respostas** do aluno: upsert em `response` (1 por situação); IDs locais mapeados para UUIDs por slug/posição.
  - **Conteúdo, turmas, leads** lidos do Supabase. **Painel** agrega no servidor com k-anonimato (n ≥ 10).
- **Sem Supabase:** modo demo offline — JSON (`data/db.json`) + cookie assinado (`SESSION_SECRET`).
- Ainda local/JSON: **edição de situações no /admin** (não grava no Supabase).
- Usuários demo (senha `demo1234`): `node scripts/create-demo-users.cjs` (com env carregado) cria aluno@/gestor@/admin@demo.com e os `member`.

### Variáveis na Vercel
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `SUPABASE_SERVICE_ROLE_KEY` (sensível, só servidor), `SESSION_SECRET` (fallback). Node 22 recomendado (o app inclui `ws` para Node 20).
