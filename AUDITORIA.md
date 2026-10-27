# Auditoria de acessibilidade e qualidade — Vape Zero

Data: 27/10/2026 (horário de Brasília) · Ambiente: produção (https://vape-zero.vercel.app)
Ferramentas: Lighthouse 12 (mobile, Chrome headless), axe-core (WCAG 2.0/2.1/2.2 A+AA + best-practice), revisão de código.

## 1. Notas Lighthouse (mobile)

| Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| `/` (home) | 100 | 100 | 100 | 100 |
| `/entrar` | 99 | 100 | 100 | 100 |
| `/aluno/trilha` (logado como aluno) | 98 | 95 → corrigido* | 100 | 100 |

\* O ponto perdido em `/aluno/trilha` era o `aria-label` em `<span>` (ver abaixo). Já foi corrigido e o axe agora dá 0 violações nessa página.

## 2. axe-core: violações por página

| Página | Antes | Depois da correção |
|---|---|---|
| `/`, `/legal/termos`, `/legal/privacidade`, `/aluno`, `/aluno/situacao/pressao-social`, `/painel`, `/admin` | 0 | 0 |
| `/entrar`, `/cadastro`, `/gestor/entrar` | 1 (moderada: sem `<h1>`) | 0 |
| `/aluno/trilha` | 1 (séria: `aria-label` proibido em `<span>`, 7 ocorrências) | 0 |

## 3. Achados

### Crítico
- Nenhum.

### Sério
- **[CORRIGIDO] `/aluno/trilha`: etapas bloqueadas da trilha.** Usavam `<span aria-label>` sem papel, e o leitor de tela podia ignorar o nome da etapa.
  - Correção: adicionado `role="img"` (`src/components/trail-path.tsx`).

### Moderado
- **[CORRIGIDO] `/entrar`, `/cadastro`, `/gestor/entrar`: páginas sem título `<h1>`.**
  - Correção: o título do cartão de login/cadastro agora é `<h1>` (`src/components/auth-card.tsx`).
- **[CORRIGIDO] Todas as páginas: faltava link "Pular para o conteúdo".**
  - Correção: o link aparece ao navegar por teclado e leva ao `<main id="conteudo">` (`src/app/layout.tsx`).
- **[CORRIGIDO] SEO e privacidade: `robots.txt` e `sitemap.xml` davam 404.**
  - Correção: criados `src/app/robots.ts` e `src/app/sitemap.ts`.
  - O `robots.txt` bloqueia a indexação de `/aluno`, `/painel`, `/admin` e `/gestor`, o que importa num app para adolescentes.
- **Cookie de sessão do Supabase sem `HttpOnly`.** Esse é o padrão do `@supabase/ssr`, que precisa do cookie no navegador.
  - O risco é aceitável com HTTPS + HSTS + SameSite=Lax.
  - Recomenda-se uma Content-Security-Policy (CSP) para reduzir o risco de XSS (ver próximos passos).
  - Obs.: na leitura automatizada o cookie apareceu sem a flag `Secure`. Confirmar no DevTools; se for o caso, definir `secure: true` nas opções de cookie em produção.

### Menor
- **[CORRIGIDO] Faltavam cabeçalhos de segurança.**
  - Adicionados: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` e `Permissions-Policy` (câmera, microfone e localização desligados) (`next.config.ts`).
  - O HSTS já vinha da Vercel.
- **Desempenho:** cerca de 11–12 KiB de JavaScript legado (polyfills) e um CSS que bloqueia a renderização (~90 ms). O bf-cache também está desativado.
  - Impacto baixo; as notas já são 98–100.
- **Revisão de código: pontos que já estão bons.**
  - `lang="pt-BR"`.
  - Todos os campos têm `<Label>`.
  - Erros de formulário usam `role="alert"`, e o fluxo da situação usa `aria-live="polite"`.
  - A barra de progresso tem `role="progressbar"` e um nome.
  - Os links da trilha têm `focus-visible`.
  - O CSS respeita `prefers-reduced-motion`.
  - Não há `<img>` sem `alt`; as ilustrações são SVG/CSS.
  - O contraste dos chips e da trilha passou no axe.
- **Segredos:** nenhum segredo de servidor (service role, SESSION_SECRET) foi encontrado no bundle do navegador. Só a chave pública (anon/publishable), o que é esperado.
- **HTTPS:** obrigatório, com HSTS `max-age=63072000; includeSubDomains; preload`.

## 4. O que foi corrigido e publicado
- Arquivos: `src/components/trail-path.tsx`, `src/components/auth-card.tsx`, `src/app/layout.tsx`, `next.config.ts`, `src/app/robots.ts` (novo), `src/app/sitemap.ts` (novo).
- Deploy em produção: `dpl_C8KPTJ7kLP9QMcLDM87EAdhWzoqs` (READY), alias https://vape-zero.vercel.app.
- Verificado depois do deploy:
  - axe com 0 violações em 11 rotas.
  - Cabeçalhos presentes.
  - `robots.txt` no ar.
  - Login de aluno, gestor e admin funcionando.

## 5. Próximos passos recomendados (por prioridade)
1. **Content-Security-Policy.** Começar em modo `Report-Only` (permitindo o domínio do Supabase) e depois aplicar. É a principal proteção extra, porque o cookie de sessão não é HttpOnly.
2. **Confirmar a flag `Secure` nos cookies em produção.**
3. **Teste manual com leitor de tela** (NVDA/VoiceOver) e só teclado no fluxo "situação → escolha → feedback". Confirmar se o foco vai para o feedback depois da escolha.
4. **Metadados por página:** `title` e `description` próprios em `/entrar`, `/cadastro` e `/legal/*`, e Open Graph na home.
5. **Desempenho:** definir um `browserslist` moderno para cortar polyfills e revisar o que impede o bf-cache. Ganho pequeno.
6. **Rate limit nos formulários de login, cadastro e lead** (Vercel Firewall ou similar).

## 6. Atualização — CSP e metadados (deploy dpl_5vWqxHNtYX63P66HcrTYwY5kqu4Y)
- **CSP aplicada (não é Report-Only)** em `next.config.ts`:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline'`: necessário para os scripts inline do App Router em páginas estáticas; sem `unsafe-eval`.
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://*.supabase.co`
  - `font-src 'self' data:`
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
  - `media-src 'self' https://*.supabase.co`
  - `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests`
  - Nenhuma violação de CSP no console em 13 rotas, com login dos 3 perfis.
- **Título e descrição próprios em todas as rotas principais**, com o modelo de título "%s · VAPE ZERO". As situações usam o título e o resumo da própria situação.
