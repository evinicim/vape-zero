"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Lock, Play, Star, LockOpen } from "lucide-react";
import type { NodeState } from "@/lib/progress";

const styles: Record<NodeState, { bg: string; shadow: string; label: string; chip: string }> = {
  completed: { bg: "bg-gradient-to-b from-[oklch(0.72_0.13_165)] to-primary text-primary-foreground", shadow: "oklch(0.45 0.09 175)", label: "Concluída", chip: "text-primary" },
  in_progress: { bg: "bg-gradient-to-b from-[oklch(0.75_0.1_225)] to-[oklch(0.62_0.1_232)] text-white", shadow: "oklch(0.47 0.09 235)", label: "Em progresso", chip: "text-[oklch(0.5_0.1_235)]" },
  available: { bg: "bg-gradient-to-b from-[oklch(0.92_0.12_95)] to-[oklch(0.84_0.14_85)] text-[oklch(0.35_0.07_70)]", shadow: "oklch(0.68 0.12 75)", label: "Disponível", chip: "text-[oklch(0.5_0.11_70)]" },
  locked: { bg: "bg-muted text-muted-foreground/70", shadow: "oklch(0.84 0.01 220)", label: "Bloqueada", chip: "text-muted-foreground" },
};
function Icon({ s }: { s: NodeState }) {
  if (s === "completed") return <Check className="size-8 drop-shadow-sm" strokeWidth={3.5} />;
  if (s === "locked") return <Lock className="size-6" strokeWidth={2.5} />;
  if (s === "in_progress") return <Play className="size-7 translate-x-0.5 fill-current" />;
  return <Star className="size-8 fill-current drop-shadow-sm" />;
}

export interface TrailNode { id: string; title: string; subtitle?: string; state: NodeState; href?: string }

const W = 320, C = W / 2, OFF = 82, GAP = 140, R = 38, TOP = 8; // zigzag alternado; rótulos ficam do lado interno, na altura do nó
const cx = (i: number) => C + (i % 2 === 0 ? -OFF : OFF);
const cy = (i: number) => TOP + R + i * GAP;
const SEEN = "vz_seen_available";

export function TrailPath({ nodes }: { nodes: TrailNode[] }) {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  useEffect(() => { // animação de desbloqueio: nó disponível que o aluno ainda não tinha visto
    try {
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN) ?? "[]");
      const open = nodes.filter((n) => n.state !== "locked").map((n) => n.id);
      const anyDone = nodes.some((n) => n.state === "completed");
      const fresh = nodes.filter((n) => n.state === "available" && !seen.includes(n.id)).map((n) => n.id);
      if (anyDone && seen.length) setUnlocked(fresh);
      localStorage.setItem(SEEN, JSON.stringify([...new Set([...seen, ...open])]));
    } catch { /* sem storage: sem animação */ }
  }, [nodes]);
  const H = cy(nodes.length - 1) + R + 16;
  const gid = `vz-g-${nodes[0]?.id ?? "x"}`;
  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      <svg className="absolute inset-0 overflow-visible" width={W} height={H} aria-hidden>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.75 0.13 160)" /><stop offset="1" stopColor="var(--primary)" /></linearGradient></defs>
        {nodes.slice(0, -1).map((n, i) => {
          const x1 = cx(i), x2 = cx(i + 1), y1 = cy(i) + R + 6, y2 = cy(i + 1) - R - 6;
          const d = `M ${x1} ${y1} C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`; // sai por baixo, entra por cima: rótulos laterais ficam livres
          const done = n.state === "completed";
          return (<g key={n.id} className="vz-seg" style={{ ["--i" as string]: i }}>
            <path d={d} fill="none" strokeLinecap="round" strokeWidth={14} stroke="var(--background)" opacity={0.7} />
            {done ? <path d={d} fill="none" strokeLinecap="round" strokeWidth={10} stroke={`url(#${gid})`} className="vz-draw" pathLength={1} />
              : <path d={d} fill="none" strokeLinecap="round" strokeWidth={7} stroke="oklch(0.85 0.015 200)" strokeDasharray="0.1 16" />}
          </g>);
        })}
      </svg>
      {nodes.map((n, i) => {
        const st = styles[n.state], left = i % 2 === 0;
        const isNew = unlocked.includes(n.id);
        const ring = n.state === "available" || n.state === "in_progress";
        const circle = (<span className={`vz-node relative flex size-[76px] items-center justify-center rounded-full ring-4 ring-background ${st.bg} ${n.state === "available" ? "vz-pulse" : ""} ${isNew ? "vz-unlock" : ""} ${n.state !== "locked" ? "hover:-translate-y-0.5" : "cursor-not-allowed"}`}
          style={{ ["--node-shadow" as string]: st.shadow }}>
          {ring && <span className={`vz-halo absolute -inset-2.5 rounded-full border-4 ${n.state === "available" ? "border-[oklch(0.86_0.12_88)]" : "border-[oklch(0.75_0.09_230)]"}`} aria-hidden />}
          <span className="absolute inset-x-3 top-1.5 h-4 rounded-full bg-white/25" aria-hidden />
          {isNew ? <><span className="vz-unlock-icon absolute"><LockOpen className="size-6" /></span><span className="vz-unlock-star"><Icon s={n.state} /></span></> : <Icon s={n.state} />}
          {n.state === "completed" && <span className="absolute -right-1 -top-1 rounded-full bg-[oklch(0.86_0.13_90)] px-1.5 text-[10px] font-bold text-[oklch(0.35_0.07_70)] shadow">+10</span>}
        </span>);
        return (
          <div key={n.id} className="vz-enter absolute" style={{ ["--i" as string]: i, top: cy(i) - R, left: cx(i) - R }}>
            {n.state === "locked" || !n.href ? <span role="img" aria-label={`${n.title} — ${st.label}`} className="block">{circle}</span>
              : <Link href={n.href} aria-label={`${n.title} — ${st.label}`} className="block rounded-full focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring">{circle}</Link>}
            <div className={`vz-chip absolute top-1/2 w-[132px] -translate-y-1/2 ${left ? "" : "text-right"}`}
              style={left ? { left: 2 * R + 14 } : { right: 2 * R + 14 }}>
              <p className={`text-sm font-bold leading-tight ${n.state === "locked" ? "text-muted-foreground" : ""}`}>{n.title}</p>
              <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${st.chip}`}>{st.label}{n.subtitle ? <span className="font-normal normal-case tracking-normal text-muted-foreground"> · {n.subtitle}</span> : null}</p>
            </div>
          </div>);
      })}
    </div>);
}

export function StatsHeader({ xp, streak, completed, total }: { xp: number; streak: number; completed: number; total: number }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const chip = (emoji: string, v: string, l: string, tone: string) => (
    <div className={`flex min-w-0 items-center gap-1 rounded-2xl px-1.5 py-1.5 sm:gap-2 sm:px-3 ${tone}`}><span className="text-base sm:text-lg" aria-hidden>{emoji}</span>
      <div className="min-w-0"><p className="whitespace-nowrap text-[13px] font-extrabold leading-none sm:text-sm">{v}</p><p className="truncate text-[9px] font-semibold uppercase tracking-normal opacity-70 sm:text-[10px] sm:tracking-wide">{l}</p></div></div>);
  return (
    <div className="w-full max-w-sm rounded-3xl border bg-card p-2.5 shadow-sm sm:p-3">
      <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-1.5">
        {chip("🔥", `${streak} dia${streak === 1 ? "" : "s"}`, "sequência", "bg-[oklch(0.95_0.05_50)] text-[oklch(0.45_0.12_45)]")}
        {chip("⭐", `${xp} XP`, "pontos", "bg-[oklch(0.96_0.06_95)] text-[oklch(0.42_0.09_80)]")}
        {chip("✅", `${completed}/${total}`, "situações", "bg-accent text-accent-foreground")}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted shadow-inner" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da jornada">
          <div className="vz-bar relative h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.13_160)] to-primary shadow-[0_1px_4px_oklch(0.5_0.1_175/.4)]" style={{ width: `${Math.max(pct, 4)}%` }}>
            <span className="absolute inset-x-1.5 top-0.5 h-1 rounded-full bg-white/35" /></div></div>
        <span className="text-xs font-bold text-muted-foreground tabular-nums">{pct}%</span>
      </div>
    </div>);
}
