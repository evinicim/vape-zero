import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { deleteSituationAction } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Conteúdo: situações", description: "Gerencie as situações, escolhas e feedbacks do VAPE ZERO." };
export const dynamic = "force-dynamic";
export default async function Admin() {
  await requireRole(["admin"], "/gestor/entrar");
  const sits = (await loadDB()).situations;
  return (<div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
    <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Conteúdo: situações</h1><Link href="/admin/novo" className={buttonVariants()}>Nova situação</Link></div>
    <Card><CardHeader><CardTitle>{sits.length} situações</CardTitle></CardHeader><CardContent className="divide-y">
      {sits.map((s) => (<div key={s.id} className="flex items-center justify-between gap-3 py-3">
        <div><p className="font-medium">{s.title} {!s.published && <Badge variant="secondary">Rascunho</Badge>}</p><p className="text-sm text-muted-foreground">/{s.slug} · {s.choices.length} escolhas</p></div>
        <div className="flex gap-2"><Link href={`/admin/${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Editar</Link>
          <form action={deleteSituationAction}><input type="hidden" name="id" value={s.id} /><Button type="submit" variant="destructive" size="sm">Excluir</Button></form></div>
      </div>))}
    </CardContent></Card>
  </div>);
}
