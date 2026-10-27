import Link from "next/link";
import { getUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";

export async function Header() {
  const u = await getUser();
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-bold tracking-tight text-primary text-lg">VAPE <span className="text-foreground">ZERO</span></Link>
        <nav className="flex items-center gap-2 text-sm">
          {u ? (<>
            {u.role === "student" && <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/aluno">Minha jornada</Link>}
            {u.role !== "student" && <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/painel">Painel</Link>}
            {u.role === "admin" && <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/admin">Conteúdo</Link>}
            <form action={logoutAction}><button className={buttonVariants({ variant: "outline", size: "sm" })}>Sair</button></form>
          </>) : (<>
            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/gestor/entrar">Sou gestor</Link>
            <Link className={buttonVariants({ size: "sm" })} href="/entrar">Entrar</Link>
          </>)}
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="mt-16 border-t bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground space-y-3">
        <p><strong className="text-foreground">Aviso importante:</strong> o VAPE ZERO é uma plataforma educativa. Não faz diagnóstico e não substitui profissionais de saúde. Em caso de dúvida, procure a UBS ou ligue no <strong>Disque Saúde 136</strong>. Em emergências, ligue <strong>192 (SAMU)</strong>.</p>
        <p className="flex flex-wrap gap-4"><Link href="/legal/aviso" className="underline">Aviso legal</Link><Link href="/legal/termos" className="underline">Termos de uso</Link><Link href="/legal/privacidade" className="underline">Política de privacidade (LGPD)</Link></p>
        <p>© 2026 VAPE ZERO — Informação para escolher. Apoio para mudar.</p>
      </div>
    </footer>
  );
}
