import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/forms";
export const metadata: Metadata = { title: "Entrar — Gestor e administração", description: "Acesso para educadores, gestores e administradores do VAPE ZERO." };
export default function Page() { return <AuthCard title="Área do gestor" desc="Educadores e gestores. Demo: gestor@demo.com ou admin@demo.com / demo1234"><LoginForm area="gestor" /></AuthCard>; }
