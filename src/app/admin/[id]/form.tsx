"use client";
import { useActionState } from "react";
import { saveSituationAction } from "@/app/actions";
import { Situation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sel = "h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm";
export function SituationForm({ s }: { s?: Situation }) {
  const [st, act, pending] = useActionState(saveSituationAction, undefined);
  return (<form action={act} className="space-y-4">
    <input type="hidden" name="id" value={s?.id ?? ""} />
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="title">Título</Label><Input id="title" name="title" defaultValue={s?.title} required /></div>
      <div className="space-y-1.5"><Label htmlFor="slug">Slug (URL)</Label><Input id="slug" name="slug" defaultValue={s?.slug} placeholder="gerado do título" /></div>
      <div className="space-y-1.5"><Label htmlFor="category">Categoria</Label><select id="category" name="category" className={sel} defaultValue={s?.category ?? "pressao"}><option value="pressao">Pressão social</option><option value="curiosidade">Curiosidade</option><option value="parar">Dificuldade para parar</option></select></div>
      <div className="space-y-1.5"><Label htmlFor="illustration">Ilustração</Label><select id="illustration" name="illustration" className={sel} defaultValue={s?.illustration ?? "generica"}><option value="grupo">Grupo</option><option value="duvida">Dúvida</option><option value="caminho">Caminho</option><option value="generica">Genérica</option></select></div>
    </div>
    <div className="space-y-1.5"><Label htmlFor="summary">Resumo</Label><Input id="summary" name="summary" defaultValue={s?.summary} /></div>
    <div className="space-y-1.5"><Label htmlFor="body">Texto (parágrafos separados por linha em branco)</Label><Textarea id="body" name="body" rows={7} defaultValue={s?.body} /></div>
    <div className="space-y-1.5"><Label htmlFor="question">Pergunta</Label><Input id="question" name="question" defaultValue={s?.question ?? "O que você faz?"} /></div>
    {[0, 1, 2].map((i) => { const c = s?.choices[i]; return (<Card key={i}><CardHeader><CardTitle className="text-base">Escolha {i + 1}{i === 2 && " (opcional)"}</CardTitle></CardHeader><CardContent className="space-y-3">
      <Input name={`c${i}_label`} placeholder="Texto da escolha" defaultValue={c?.label} aria-label={`Escolha ${i + 1}`} />
      <Textarea name={`c${i}_feedback`} placeholder="Feedback educativo (curado)" defaultValue={c?.feedback} aria-label={`Feedback ${i + 1}`} />
      <div className="grid gap-3 sm:grid-cols-2"><select name={`c${i}_trail`} className={sel} defaultValue={c?.trail ?? "prevencao"} aria-label="Trilha"><option value="prevencao">Trilha prevenção</option><option value="apoio">Trilha apoio para parar</option></select>
        <select name={`c${i}_next`} className={sel} defaultValue={c?.nextStep ?? "confianca"} aria-label="Próximo passo"><option value="confianca">Pessoa de confiança</option><option value="ubs">UBS</option><option value="disque136">Disque Saúde 136</option></select></div>
    </CardContent></Card>); })}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={s?.published ?? true} /> Publicada</label>
    {st?.error && <p role="alert" className="text-sm text-destructive">{st.error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</Button>
  </form>);
}
