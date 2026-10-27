import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { SituationForm } from "./form";

export const metadata: Metadata = { title: "Editar situação", description: "Crie ou edite uma situação e suas escolhas." };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"], "/gestor/entrar");
  const { id } = await params;
  const s = id === "novo" ? undefined : (await loadDB()).situations.find((x) => x.id === id);
  if (id !== "novo" && !s) notFound();
  return (<div className="mx-auto max-w-3xl px-4 py-10 space-y-6"><h1 className="text-3xl font-bold">{s ? "Editar situação" : "Nova situação"}</h1><SituationForm s={s} /></div>);
}
