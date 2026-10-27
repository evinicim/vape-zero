import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { Illustration } from "@/components/illustration";
import { SituationFlow } from "./flow";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = (await loadDB()).situations.find((x) => x.slug === slug && x.published);
  return s ? { title: `Situação: ${s.title}`, description: s.summary || "Escolha o que você faria e veja o feedback." } : { title: "Situação" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole(["student"]);
  const { slug } = await params;
  const s = (await loadDB()).situations.find((x) => x.slug === slug && x.published);
  if (!s) notFound();
  return (<article className="mx-auto max-w-2xl px-4 py-10 space-y-6">
    <p className="text-sm text-primary font-medium">Situação</p>
    <h1 className="text-3xl font-bold">{s.title}</h1>
    <Illustration kind={s.illustration} />
    <div className="space-y-4 leading-relaxed">{s.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>
    <SituationFlow situation={s} />
  </article>);
}
