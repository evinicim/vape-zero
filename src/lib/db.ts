import "server-only";
import fs from "fs";
import path from "path";
import { DB } from "./types";
import { buildSeed } from "./seed";

// Camada de dados local (JSON). Na Vercel o FS é somente leitura (exceto /tmp): usa /tmp e semeia a partir de data/db.json (ou seed).
const BUNDLED = path.join(process.cwd(), "data", "db.json");
const FILE = process.env.LOCAL_DB_PATH || (process.env.VERCEL ? "/tmp/vape-zero-db.json" : BUNDLED);
let mem: DB | null = null;

export function readDB(): DB {
  try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf8")) as DB; } catch { /* segue */ }
  if (mem) return mem;
  let s: DB;
  try { s = fs.existsSync(BUNDLED) ? (JSON.parse(fs.readFileSync(BUNDLED, "utf8")) as DB) : buildSeed(); } catch { s = buildSeed(); }
  writeDB(s); return s;
}
export function writeDB(db: DB) {
  mem = db;
  try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }
  catch (e) { console.warn("[db] sem escrita em disco, usando memória:", (e as Error).message); }
}
export function mutate<T>(fn: (db: DB) => T): T { const db = readDB(); const r = fn(db); writeDB(db); return r; }
export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
