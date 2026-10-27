import type { Metadata } from "next";
import { notFound } from "next/navigation";
const docs: Record<string, { title: string; body: string[] }> = {
  aviso: { title: "Aviso legal", body: [
    "O VAPE ZERO é uma plataforma educativa de prevenção e promoção da saúde. Não realiza diagnóstico, tratamento ou acompanhamento clínico e não substitui consulta com profissionais de saúde.",
    "Os conteúdos são informativos e curados por uma equipe editorial. Não há chat livre com inteligência artificial nesta versão.",
    "A plataforma não promove, exibe ou recomenda marcas ou produtos de cigarro eletrônico. No Brasil, a comercialização desses dispositivos é proibida pela Anvisa (RDC 855/2024).",
    "Em caso de dúvidas sobre saúde, procure a UBS mais próxima ou ligue no Disque Saúde 136. Em emergência, ligue 192 (SAMU).",
  ]},
  termos: { title: "Termos de uso", body: [
    "Ao criar uma conta, você concorda em usar a plataforma de forma respeitosa e para fins educativos.",
    "Usuários menores de 18 anos devem ter ciência e autorização de seu responsável legal, normalmente intermediada pela instituição de ensino ou saúde contratante.",
    "A instituição contratante acessa apenas relatórios agregados e anônimos; respostas individuais não são exibidas a educadores.",
    "Estes termos são um rascunho do MVP e devem ser revisados por assessoria jurídica antes do lançamento.",
  ]},
  privacidade: { title: "Política de privacidade (LGPD)", body: [
    "Coletamos o mínimo necessário: apelido/nome, e-mail, senha (armazenada com hash) e a turma. Não coletamos CPF, endereço ou dados de saúde clínicos.",
    "Tratamos dados de crianças e adolescentes no seu melhor interesse (art. 14 da LGPD), com base no consentimento do responsável e/ou na execução de política pública educacional pela instituição.",
    "Relatórios institucionais exibem apenas agregados com no mínimo 10 alunos por grupo (k-anonimato).",
    "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo canal do encarregado (DPO) — a definir.",
    "Dados hospedados em infraestrutura com região no Brasil (São Paulo), quando disponível.",
  ]},
};
export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = docs[(await params).doc]; return d ? { title: d.title, description: `${d.title} do VAPE ZERO.` } : {};
}
export function generateStaticParams() { return Object.keys(docs).map((doc) => ({ doc })); }
export default async function Page({ params }: { params: Promise<{ doc: string }> }) {
  const d = docs[(await params).doc]; if (!d) notFound();
  return (<article className="mx-auto max-w-2xl px-4 py-10 space-y-4"><h1 className="text-3xl font-bold">{d.title}</h1>{d.body.map((p) => <p key={p} className="leading-relaxed">{p}</p>)}</article>);
}
