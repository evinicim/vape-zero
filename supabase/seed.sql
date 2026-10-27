-- Seed mínimo (conteúdo). Usuários demo devem ser criados via Supabase Auth.
insert into organization (id, name) values ('00000000-0000-0000-0000-000000000001','Escola Estadual Demonstração');
insert into class (org_id, name, join_code) values
 ('00000000-0000-0000-0000-000000000001','8º ano A','8A2026'),('00000000-0000-0000-0000-000000000001','9º ano B','9B2026');
insert into trail (key, title, description) values ('prevencao','Trilha Prevenção','Fortalecer escolhas'),('apoio','Trilha Apoio para Parar','Passos no seu ritmo');
insert into situation (slug, title, category, summary, illustration, published) values
 ('pressao-social','Pressão social','pressao','Seus amigos oferecem um vape numa festa.','grupo',true),
 ('curiosidade','Curiosidade','curiosidade','Você viu vídeos sobre vape e ficou curioso(a).','duvida',true),
 ('dificuldade-para-parar','Dificuldade para parar','parar','Você já usa e está difícil parar.','caminho',true);
-- textos completos e escolhas: ver src/lib/seed.ts (fonte única do conteúdo demo)
