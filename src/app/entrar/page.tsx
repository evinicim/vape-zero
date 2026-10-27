import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/forms";
export const metadata: Metadata = { title: "Entrar — Aluno", description: "Acesse sua jornada no VAPE ZERO com seu e-mail e senha." };
export default function Page() { return <AuthCard title="Entrar" desc="Área do aluno. Demo: aluno@demo.com / demo1234"><LoginForm area="aluno" /></AuthCard>; }
