import { DB, Member, Situation, TrailKey } from "./types";
export type NodeState = "locked" | "available" | "in_progress" | "completed";
export interface PathNode { situation: Situation; state: NodeState }

// Prevenção é desbloqueada em sequência; "Dificuldade para parar" (apoio) NUNCA fica bloqueada.
export function buildPath(db: DB, u: Member, started: string[]): PathNode[] {
  const sits = db.situations.filter((s) => s.published);
  const done = new Set(db.responses.filter((r) => r.memberId === u.id).map((r) => r.situationId));
  let unlocked = true;
  return sits.map((s) => {
    let state: NodeState;
    if (done.has(s.id)) state = "completed";
    else if (unlocked || s.category === "parar") { state = started.includes(s.id) ? "in_progress" : "available"; if (s.category !== "parar") unlocked = false; }
    else state = "locked";
    return { situation: s, state };
  });
}
export function stats(db: DB, u: Member) {
  const mine = db.responses.filter((r) => r.memberId === u.id);
  const days = new Set(mine.map((r) => r.createdAt.slice(0, 10)));
  let streak = 0; const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
  const trails = [...new Set(mine.map((r) => r.trail))] as TrailKey[];
  return { xp: mine.length * 10, streak, completed: new Set(mine.map((r) => r.situationId)).size, trails };
}
