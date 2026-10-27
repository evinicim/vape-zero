"use client";
import { useActionState } from "react";
import Link from "next/link";
import { loginAction, signupAction, leadAction, FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Msg = ({ s }: { s: FormState }) => s?.error ? <p role="alert" className="text-sm text-destructive">{s.error}</p> : s?.ok ? <p role="status" className="text-sm text-primary font-medium">{s.ok}</p> : null;
const F = ({ id, label, ...p }: { id: string; label: string } & React.ComponentProps<"input">) => (<div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} name={id} {...p} /></div>);

export function LoginForm({ area }: { area: "aluno" | "gestor" }) {
  const [st, act, pending] = useActionState(loginAction, undefined);
  return (<form action={act} className="space-y-4">
    <input type="hidden" name="area" value={area} />
    <F id="email" label="E-mail" type="email" required autoComplete="email" defaultValue={area === "aluno" ? "aluno@demo.com" : "gestor@demo.com"} />
    <F id="password" label="Senha" type="password" required autoComplete="current-password" defaultValue="demo1234" />
    <Msg s={st} />
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Entrando..." : "Entrar"}</Button>
    {area === "aluno" && <p className="text-sm text-center text-muted-foreground">Ainda não tem conta? <Link className="underline" href="/cadastro">Criar conta</Link></p>}
  </form>);
}

export function SignupForm() {
  const [st, act, pending] = useActionState(signupAction, undefined);
  return (<form action={act} className="space-y-4">
    <F id="name" label="Como quer ser chamado(a)? (pode ser apelido)" required />
    <F id="email" label="E-mail" type="email" required />
    <F id="password" label="Senha (mín. 8 caracteres)" type="password" required minLength={8} />
    <F id="code" label="Código da turma" required placeholder="ex.: 8A2026" />
    <label className="flex gap-2 text-sm items-start"><input type="checkbox" name="terms" className="mt-1" /> <span>Li os <Link href="/legal/termos" className="underline">termos</Link> e a <Link href="/legal/privacidade" className="underline">política de privacidade</Link>. Se tenho menos de 18 anos, meu responsável está ciente e autoriza.</span></label>
    <Msg s={st} />
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Criando..." : "Criar conta"}</Button>
  </form>);
}

export function LeadForm() {
  const [st, act, pending] = useActionState(leadAction, undefined);
  return (<form action={act} className="grid gap-4 sm:grid-cols-2">
    <F id="name" label="Nome" required />
    <F id="email" label="E-mail institucional" type="email" required />
    <F id="institution" label="Instituição" required placeholder="Escola, secretaria, UBS..." />
    <F id="role" label="Cargo" placeholder="Coordenação, direção..." />
    <div className="sm:col-span-2 space-y-1.5"><Label htmlFor="message">Mensagem (opcional)</Label><Textarea id="message" name="message" rows={3} /></div>
    <div className="sm:col-span-2 space-y-2"><Msg s={st} /><Button type="submit" disabled={pending}>{pending ? "Enviando..." : "Solicitar demonstração"}</Button></div>
  </form>);
}
