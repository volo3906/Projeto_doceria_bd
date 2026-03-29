import fs from "fs";
import path from "path";
import { Pool } from "pg";

// carrega .env.local se existir
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2];
      // remove aspas
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      obj[m[1]] = val;
    }
  }
  return obj;
}

async function run() {
  const repoRoot = path.resolve(".");
  const env = loadEnv(path.join(repoRoot, ".env.local"));
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL não encontrado em .env.local ou environment variables.");
    process.exit(1);
  }

  const sqlPath = path.join(repoRoot, "sql", "init.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Arquivo sql/init.sql não encontrado.");
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    console.log("Executando script SQL... isso pode levar alguns segundos");
    // divide por ; de forma simples para evitar problema com statements grandes
    // mas tenta executar tudo de uma vez para preservar ordem
    await client.query(sql);
    console.log("SQL executado com sucesso.");
  } catch (err) {
    console.error("Erro ao executar SQL:", err.message || err);
    process.exitCode = 2;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
