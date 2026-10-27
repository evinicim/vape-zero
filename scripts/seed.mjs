// Reseta a base local: apaga data/db.json; ela é recriada com o seed na próxima requisição.
import fs from "fs"; import path from "path";
const f = process.env.LOCAL_DB_PATH || path.join(process.cwd(), "data", "db.json");
if (fs.existsSync(f)) fs.rmSync(f);
console.log("Base local resetada. O seed (src/lib/seed.ts) será aplicado na próxima requisição.");
