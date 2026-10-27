# VAPE ZERO — Briefing do MVP

## Marca
- Nome: VAPE ZERO
- Slogan: "Informação para escolher. Apoio para mudar."
- Tom: próximo, educativo, sem julgamento; nunca parecer propaganda de vape/marcas.

## Decisões confirmadas
- Escopo: prevenção + apoio para quem quer parar
- Conteúdo: texto + ilustração (sem vídeo nesta fase)
- Login do aluno: com conta (e-mail/senha ou magic link)
- Cliente-alvo: foque no produto (não otimizar pitch B2G agora)

## Produto
Plataforma digital de prevenção e educação em saúde para adolescentes (~13–17).
Não diagnostica nem substitui profissionais de saúde.
Clientes pagantes (depois): escolas, redes, secretarias, UBS, hospitais, clínicas.
Usuários: adolescentes, educadores, profissionais.

## Features centrais do MVP
1. Landing institucional (problema, como funciona, planos estimados, form "Solicitar demonstração")
2. Auth: cadastro/login do aluno; login do gestor institucional
3. Experiência do aluno:
   - Escolher situação: pressão social | curiosidade | dificuldade para parar
   - Conteúdo texto + ilustração (placeholders SVG/ilustrações simples)
   - Decisão com 2–3 escolhas → feedback educativo → próximo passo (conversar com alguém de confiança, UBS, Disque Saúde 136)
   - Trilha sugerida a partir das respostas (prevenção e/ou apoio para parar)
4. Painel institucional: turmas, alcance, conclusões, escolhas frequentes — só agregados (mín. k-anonimato n≥10 quando possível)
5. Admin de conteúdo: CRUD de situações/cenários (texto/ilustração)
6. Avisos legais + termos + política de privacidade (LGPD / menores)

## Stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, PWA
- Supabase: Postgres + Auth + RLS + Storage (região São Paulo se possível)
- Deploy: Vercel + Supabase
- Charts: Recharts
- Sem vídeo nesta fase (deixar hooks no modelo para Mux/Cloudflare Stream depois)
- IA: opcional e restrita — NÃO implementar chat livre nesta fase; feedbacks podem ser textos curados

## Modelo de dados (mínimo)
organization, class/turma, member (role: student|educator|admin), situation, scenario_step, choice, response, trail, lead (demo request)

## Ordem de build
1. Scaffold Next.js + design system (cores calm/health, tipografia limpa, componentes shadcn)
2. Schema SQL + RLS no Supabase (migrations no repo; .env.example)
3. Auth (aluno + gestor)
4. Fluxo do aluno (3 situações seed)
5. Painel institucional
6. Admin de conteúdo
7. Landing + form de lead
8. README com como rodar local; scripts de seed
9. Lighthouse/axe checklist no README; testes Playwright básicos do fluxo aluno se der tempo

## Restrições
- Nunca mostrar marcas de vape de forma atrativa
- Sem diagnóstico clínico
- Dados de menores: cuidado LGPD; preferir mínimo de PII; painel só agregado
- PT-BR em toda UI

## Done quando
- `npm run build` passa
- Fluxo aluno completo com seed (login → situação → escolha → feedback → trilha)
- Painel com números fake/seed agregados
- Landing com formulário (pode gravar lead no DB)
- README claro; .env.example
