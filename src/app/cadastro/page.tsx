import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/forms";
export const metadata: Metadata = { title: "Criar conta", description: "Crie sua conta de aluno com o código da turma informado pela escola." };
export default function Page() { return <AuthCard title="Criar conta" desc="Pedimos o mínimo de dados possível. Seu nome não aparece para a escola nos relatórios."><SignupForm /></AuthCard>; }
