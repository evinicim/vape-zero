import { Situation } from "@/lib/types";
// Ilustrações simples em SVG (placeholders). Nunca mostram marcas ou produtos de forma atrativa.
export function Illustration({ kind, className = "" }: { kind: Situation["illustration"]; className?: string }) {
  const p = (c: string, x: number, y: number, r = 18) => (<g key={`${x}${y}`}><circle cx={x} cy={y} r={r} fill={c} /><rect x={x - r} y={y + r + 4} width={r * 2} height={r * 2.4} rx={r} fill={c} opacity=".85" /></g>);
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="Ilustração da situação" className={`w-full rounded-2xl bg-secondary ${className}`}>
      <circle cx="270" cy="40" r="22" fill="#fde68a" opacity=".8" />
      <path d="M0 150 Q80 120 160 150 T320 145 V180 H0Z" fill="#a7d7c5" opacity=".6" />
      {kind === "grupo" && <>{p("#5b9e8f", 90, 70)}{p("#7fb7c9", 150, 60, 20)}{p("#9fb4e0", 210, 70)}<text x="150" y="30" textAnchor="middle" fontSize="22" fill="#486">💬</text></>}
      {kind === "duvida" && <>{p("#7fb7c9", 150, 65, 22)}<text x="195" y="55" fontSize="40" fill="#5b9e8f" fontWeight="700">?</text><rect x="40" y="50" width="50" height="80" rx="8" fill="#fff" stroke="#9fb4e0" strokeWidth="3" /></>}
      {kind === "caminho" && <><path d="M40 160 C120 100 180 140 280 70" stroke="#5b9e8f" strokeWidth="8" fill="none" strokeDasharray="14 10" strokeLinecap="round" />{p("#7fb7c9", 70, 95, 16)}<text x="270" y="65" fontSize="26">🌱</text></>}
      {kind === "generica" && <>{p("#7fb7c9", 160, 65, 22)}</>}
    </svg>
  );
}
