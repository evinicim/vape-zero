import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
export function hashPassword(p: string) { const s = randomBytes(16).toString("hex"); return `${s}:${scryptSync(p, s, 32).toString("hex")}`; }
export function verifyPassword(p: string, h: string) { const [s, k] = h.split(":"); const a = Buffer.from(k, "hex"); const b = scryptSync(p, s, 32); return a.length === b.length && timingSafeEqual(a, b); }
