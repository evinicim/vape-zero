import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChoicesChart } from "./chart";

export const metadata: Metadata = { title: "Painel institucional", description: "Dados agregados e anônimos de participação das turmas da sua escola." };
export const dynamic = "force-dynamic";
const K = 10; // k-anonimato mínimo
export default async function Painel() {
  const u = await requireRole(["educator", "admin"], "/gestor/entrar");
  const db = (await loadDB());
  const classes = db.classes.filter((c) => c.orgId === u.orgId);
  const org = db.organizations.find((o) => o.id === u.orgId);
  const resp = db.responses.filter((r) => classes.some((c) => c.id === r.classId));
  const rows = classes.map((c) => {
    const rs = resp.filter((r) => r.classId === c.id);
    const users = new Set(rs.map((r) => r.memberId));
    const completed = [...users].filter((m) => rs.filter((r) => r.memberId === m).length >= db.situations.filter((s) => s.published).length).length;
    return { c, reach: users.size, completed, answers: rs.length, hidden: users.size < K };
  });
  const visible = rows.filter((r) => !r.hidden);
  const visResp = resp.filter((r) => visible.some((v) => v.c.id === r.classId));
  const reach = visible.reduce((a, r) => a + r.reach, 0);
  const chart = db.situations.map((s) => ({ situation: s.title, data: s.choices.map((ch) => ({ name: ch.label.length > 40 ? ch.label.slice(0, 40) + "…" : ch.label, total: visResp.filter((r) => r.choiceId === ch.id).length })) }));
  const apoio = new Set(visResp.filter((r) => r.trail === "apoio").map((r) => r.memberId)).size;
  return (<div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
    <div><h1 className="text-3xl font-bold">Painel institucional</h1><p className="text-muted-foreground">{org?.name} · Apenas dados agregados e anônimos. Grupos com menos de {K} alunos não são exibidos.</p></div>
    <div className="grid gap-4 sm:grid-cols-4">
      {[["Turmas", classes.length], ["Alunos alcançados", reach], ["Respostas", visResp.length], ["Indicaram trilha de apoio", apoio]].map(([l, v]) => (
        <Card key={l}><CardHeader><CardDescription>{l}</CardDescription><CardTitle className="text-3xl">{v}</CardTitle></CardHeader></Card>))}
    </div>
    {visible.length === 0 && <Card className="border-dashed"><CardHeader><CardTitle>Ainda não há dados suficientes</CardTitle><CardDescription>Para proteger a privacidade dos alunos, os números só aparecem quando uma turma tem pelo menos {K} alunos com respostas. Compartilhe o código da turma para começar.</CardDescription></CardHeader></Card>}
    <Card><CardHeader><CardTitle>Por turma</CardTitle></CardHeader><CardContent>
      <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-2">Turma</th><th>Alcance</th><th>Concluíram todas</th><th>Respostas</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.c.id} className="border-t"><td className="py-2">{r.c.name} <span className="text-xs text-muted-foreground">(código {r.c.joinCode})</span></td>
          {r.hidden ? <td colSpan={3} className="text-muted-foreground">Dados ocultos (menos de {K} alunos)</td> : <><td>{r.reach}</td><td>{r.completed} ({Math.round((r.completed / r.reach) * 100)}%)</td><td>{r.answers}</td></>}</tr>))}</tbody></table>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-3">{chart.map((c) => (<Card key={c.situation}><CardHeader><CardTitle>Escolhas: {c.situation}</CardTitle></CardHeader><CardContent><ChoicesChart data={c.data} /></CardContent></Card>))}</div>
    {u.role === "admin" && <Card><CardHeader><CardTitle>Pedidos de demonstração ({db.leads.length})</CardTitle></CardHeader><CardContent className="text-sm space-y-1">{db.leads.length === 0 ? "Nenhum ainda." : db.leads.map((l) => <p key={l.id}>{l.institution} — {l.name} ({l.email})</p>)}</CardContent></Card>}
  </div>);
}
