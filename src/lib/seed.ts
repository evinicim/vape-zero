import { DB, Situation } from "./types";
import { hashPassword } from "./password";

export const seedSituations: Situation[] = [
  {
    id: "sit-pressao", slug: "pressao-social", title: "Pressão social", category: "pressao", illustration: "grupo", published: true,
    summary: "Seus amigos oferecem um vape numa festa. E agora?",
    body: "É sábado à noite e você está com a sua turma. Alguém tira um vape do bolso, dá uma tragada e passa pra você: \"Relaxa, é só sabor de fruta, não faz nada\". Todo mundo olha. Você sente aquele frio na barriga de não querer parecer careta.\n\nVale saber: a maioria dos vapes tem nicotina — muitas vezes em quantidade alta — mesmo quando o cheiro é doce. A nicotina age rápido no cérebro adolescente, que ainda está em formação, e pode gerar dependência.",
    question: "O que você faz?",
    choices: [
      { id: "c-p1", label: "Recuso com uma frase curta: \"Não, valeu\" e mudo de assunto.", trail: "prevencao", nextStep: "confianca", feedback: "Boa! Uma recusa simples e segura funciona muito bem. Você não precisa se justificar. Amigos de verdade respeitam um \"não\"." },
      { id: "c-p2", label: "Aceito só uma vez para não ficar de fora.", trail: "prevencao", nextStep: "confianca", feedback: "Entendemos — a vontade de pertencer é real. Mas \"só uma vez\" é como muita dependência começa. Da próxima, experimente ter uma frase pronta ou um plano de saída (ex.: \"vou pegar água\")." },
      { id: "c-p3", label: "Saio de perto e chamo alguém de confiança.", trail: "prevencao", nextStep: "confianca", feedback: "Ótima escolha. Afastar-se da situação e buscar apoio mostra autocuidado. Conversar com alguém de confiança ajuda a se preparar para as próximas vezes." },
    ],
  },
  {
    id: "sit-curiosidade", slug: "curiosidade", title: "Curiosidade", category: "curiosidade", illustration: "duvida", published: true,
    summary: "Você viu vídeos sobre vape e ficou curioso(a).",
    body: "Nas redes, aparece gente fazendo nuvens de fumaça e truques. Parece inofensivo e até divertido. Você fica pensando: \"Será que é tão ruim assim?\"\n\nFatos: no Brasil, a venda de cigarros eletrônicos é proibida pela Anvisa. Os líquidos podem conter nicotina, metais e substâncias que irritam os pulmões. Conteúdo nas redes muitas vezes é publicidade disfarçada.",
    question: "Qual é o seu próximo passo?",
    choices: [
      { id: "c-c1", label: "Procuro informação em fontes confiáveis (Ministério da Saúde, INCA).", trail: "prevencao", nextStep: "confianca", feedback: "Excelente! Curiosidade é ótima quando vem com boas fontes. Você está tomando uma decisão informada." },
      { id: "c-c2", label: "Experimento para ver como é.", trail: "prevencao", nextStep: "ubs", feedback: "A curiosidade é natural, mas experimentar expõe você à nicotina e a outros riscos. Se tiver dúvidas sobre saúde, a UBS mais próxima pode conversar com você sem julgamento." },
      { id: "c-c3", label: "Pergunto para um adulto de confiança o que ele sabe.", trail: "prevencao", nextStep: "confianca", feedback: "Boa ideia. Conversar abre espaço para tirar dúvidas e pensar junto, sem pressão." },
    ],
  },
  {
    id: "sit-parar", slug: "dificuldade-para-parar", title: "Dificuldade para parar", category: "parar", illustration: "caminho", published: true,
    summary: "Você já usa e está difícil parar.",
    body: "Você começou \"só de vez em quando\", mas agora sente vontade várias vezes ao dia. Já tentou parar e ficou irritado(a), ansioso(a) ou com dificuldade de concentração.\n\nIsso não é fraqueza: são sinais comuns de dependência de nicotina. A boa notícia é que dá para parar, e você não precisa fazer isso sozinho(a). O SUS oferece apoio gratuito.",
    question: "O que você gostaria de fazer agora?",
    choices: [
      { id: "c-s1", label: "Quero conversar com alguém de confiança sobre isso.", trail: "apoio", nextStep: "confianca", feedback: "Esse é um passo corajoso. Contar para alguém de confiança deixa o caminho mais leve. Você pode começar com: \"Preciso de ajuda com uma coisa\"." },
      { id: "c-s2", label: "Quero saber onde buscar ajuda profissional.", trail: "apoio", nextStep: "ubs", feedback: "Ótimo. A UBS (Unidade Básica de Saúde) oferece acompanhamento gratuito para quem quer parar com a nicotina. Você também pode ligar no Disque Saúde 136." },
      { id: "c-s3", label: "Ainda não sei se quero parar.", trail: "apoio", nextStep: "disque136", feedback: "Tudo bem não ter certeza. Que tal observar quando a vontade aparece? Informação ajuda a decidir. O Disque Saúde 136 tira dúvidas de forma gratuita e sigilosa." },
    ],
  },
];

export function buildSeed(): DB {
  const now = Date.now();
  const orgId = "org-demo";
  const classes = [
    { id: "cls-8a", orgId, name: "8º ano A", joinCode: "8A2026" },
    { id: "cls-9b", orgId, name: "9º ano B", joinCode: "9B2026" },
    { id: "cls-1em", orgId, name: "1º EM", joinCode: "1EM2026" },
    { id: "cls-pequena", orgId, name: "Turma piloto (pequena)", joinCode: "PILOTO" },
  ];
  const db: DB = {
    organizations: [{ id: orgId, name: "Escola Estadual Demonstração", kind: "escola" }],
    classes,
    members: [
      { id: "m-aluno", email: "aluno@demo.com", name: "Aluno Demo", passwordHash: hashPassword("demo1234"), role: "student", orgId, classId: "cls-8a", createdAt: new Date(now).toISOString() },
      { id: "m-gestor", email: "gestor@demo.com", name: "Gestora Demo", passwordHash: hashPassword("demo1234"), role: "educator", orgId, createdAt: new Date(now).toISOString() },
      { id: "m-admin", email: "admin@demo.com", name: "Admin Demo", passwordHash: hashPassword("demo1234"), role: "admin", orgId, createdAt: new Date(now).toISOString() },
    ],
    situations: seedSituations,
    responses: [],
    leads: [],
  };
  // respostas fake (anônimas) para o painel
  let seed = 42; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const sizes: Record<string, number> = { "cls-8a": 28, "cls-9b": 31, "cls-1em": 24, "cls-pequena": 6 };
  for (const c of classes) {
    for (let i = 0; i < sizes[c.id]; i++) {
      const mid = `fake-${c.id}-${i}`;
      for (const s of seedSituations) {
        if (rnd() < 0.25) continue;
        const ch = s.choices[Math.floor(rnd() * s.choices.length)];
        db.responses.push({ id: `r-${mid}-${s.id}`, memberId: mid, classId: c.id, situationId: s.id, choiceId: ch.id, trail: ch.trail, createdAt: new Date(now - rnd() * 30 * 864e5).toISOString() });
      }
    }
  }
  return db;
}
