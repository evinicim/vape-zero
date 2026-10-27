export type Role = "student" | "educator" | "admin";
export type TrailKey = "prevencao" | "apoio";
export interface Organization { id: string; name: string; kind: string }
export interface ClassGroup { id: string; orgId: string; name: string; joinCode: string }
export interface Member { id: string; email: string; name: string; passwordHash: string; role: Role; orgId: string; classId?: string; createdAt: string }
export interface Choice { id: string; label: string; feedback: string; trail: TrailKey; nextStep: "confianca" | "ubs" | "disque136" }
export interface Situation {
  id: string; slug: string; title: string; category: "pressao" | "curiosidade" | "parar";
  summary: string; body: string; question: string; illustration: "grupo" | "duvida" | "caminho" | "generica";
  published: boolean; choices: Choice[]; videoUrl?: string | null; // hook p/ Mux/Stream futuro
}
export interface ResponseRow { id: string; memberId: string; classId?: string; situationId: string; choiceId: string; trail: TrailKey; createdAt: string }
export interface Lead { id: string; name: string; email: string; institution: string; role: string; message: string; createdAt: string }
export interface DB { organizations: Organization[]; classes: ClassGroup[]; members: Member[]; situations: Situation[]; responses: ResponseRow[]; leads: Lead[] }
