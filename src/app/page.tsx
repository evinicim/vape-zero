import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Illustration } from "@/components/illustration";
import { LeadForm } from "@/components/forms";

export const metadata: Metadata = { title: { absolute: "VAPE ZERO — Informação para escolher. Apoio para mudar." }, description: "Prevenção ao vape para adolescentes: situações reais, feedback sem julgamento e trilhas de apoio para escolas e UBS." };
const plans = [
  { name: "Escola", price: "a partir de R$ 4/aluno/ano*", items: ["Jornada completa do aluno", "Painel por turma", "Suporte por e-mail"] },
  { name: "Rede / Secretaria", price: "sob consulta*", items: ["Várias escolas", "Painel consolidado da rede", "Formação para educadores"] },
  { name: "Saúde (UBS, clínicas)", price: "sob consulta*", items: ["Material de apoio para parar", "Encaminhamento orientado", "Relatórios agregados"] },
];

export default function Home() {
  return (<div>
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center">
      <div className="space-y-5">
        <Badge variant="secondary">Prevenção + apoio para parar</Badge>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Informação para escolher. <span className="text-primary">Apoio para mudar.</span></h1>
        <p className="text-lg text-muted-foreground">O VAPE ZERO ajuda adolescentes de 13 a 17 anos a lidar com pressão social, curiosidade e a dificuldade de parar — com situações reais, escolhas e orientação sem julgamento.</p>
        <div className="flex flex-wrap gap-3"><Link href="/entrar" className={buttonVariants({ size: "lg" })}>Sou aluno(a)</Link><a href="#demo" className={buttonVariants({ size: "lg", variant: "outline" })}>Solicitar demonstração</a></div>
      </div>
      <Illustration kind="grupo" />
    </section>

    <section className="bg-secondary/40 py-12"><div className="mx-auto max-w-5xl px-4 space-y-6">
      <h2 className="text-2xl font-semibold">O problema</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[["Começa cedo", "O uso de cigarro eletrônico entre adolescentes cresceu, muitas vezes por influência de amigos e redes."], ["Parece inofensivo", "Sabores e cheiros doces escondem nicotina, que causa dependência rapidamente."], ["Falta apoio", "Quem quer parar raramente sabe onde buscar ajuda — e tem medo de julgamento."]].map(([t, d]) => (
          <Card key={t}><CardHeader><CardTitle>{t}</CardTitle><CardDescription>{d}</CardDescription></CardHeader></Card>))}
      </div>
    </div></section>

    <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <h2 className="text-2xl font-semibold">Como funciona</h2>
      <ol className="grid gap-4 md:grid-cols-4">
        {["O aluno cria a conta com o código da turma", "Escolhe uma situação e lê a história", "Decide o que faria e recebe feedback educativo", "Recebe próximo passo e uma trilha sugerida"].map((t, i) => (
          <li key={t} className="rounded-xl border p-4"><span className="text-primary font-bold text-2xl">{i + 1}</span><p className="mt-2 text-sm">{t}</p></li>))}
      </ol>
      <p className="text-sm text-muted-foreground">Gestores acompanham apenas dados agregados e anônimos por turma (mínimo de 10 alunos por grupo exibido).</p>
    </section>

    <section className="bg-secondary/40 py-12"><div className="mx-auto max-w-5xl px-4 space-y-6">
      <h2 className="text-2xl font-semibold">Planos (estimados)</h2>
      <div className="grid gap-4 md:grid-cols-3">{plans.map((p) => (
        <Card key={p.name}><CardHeader><CardTitle>{p.name}</CardTitle><CardDescription>{p.price}</CardDescription></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm space-y-1">{p.items.map((i) => <li key={i}>{i}</li>)}</ul></CardContent></Card>))}</div>
      <p className="text-xs text-muted-foreground">*Valores ilustrativos para o MVP, sujeitos a proposta.</p>
    </div></section>

    <section id="demo" className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <h2 className="text-2xl font-semibold">Solicitar demonstração</h2>
      <p className="text-muted-foreground">Para escolas, redes de ensino, secretarias, UBS, hospitais e clínicas.</p>
      <Card><CardContent className="pt-6"><LeadForm /></CardContent></Card>
    </section>
  </div>);
}
