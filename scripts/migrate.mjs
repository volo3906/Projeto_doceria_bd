// script pra rodar migrations pendentes no banco
// uso: node scripts/migrate.mjs

import pg from "pg";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL nao definida. Crie o .env primeiro.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function rodarMigrations() {
  await client.connect();
  console.log("Conectado ao banco.\n");

  // cria tabela de controle se nao existir (guarda quais migrations ja rodaram)
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations_executadas (
      nome VARCHAR(255) PRIMARY KEY,
      executada_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // busca quais ja rodaram
  const resultado = await client.query("SELECT nome FROM migrations_executadas ORDER BY nome");
  const jaExecutadas = resultado.rows.map((r) => r.nome);

  // le os arquivos da pasta migrations em ordem
  const pastaMigrations = path.join(process.cwd(), "sql", "migrations");
  const arquivos = fs.readdirSync(pastaMigrations)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // filtra so as pendentes
  const pendentes = arquivos.filter((f) => !jaExecutadas.includes(f));

  if (pendentes.length === 0) {
    console.log("Nenhuma migration pendente. Banco ja esta atualizado!");
    await client.end();
    return;
  }

  console.log(`${pendentes.length} migration(s) pendente(s):\n`);

  // executa cada uma dentro de uma transacao
  for (const arquivo of pendentes) {
    const caminhoCompleto = path.join(pastaMigrations, arquivo);
    const sql = fs.readFileSync(caminhoCompleto, "utf-8");

    console.log(`Executando ${arquivo}...`);

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO migrations_executadas (nome) VALUES ($1)",
        [arquivo]
      );
      await client.query("COMMIT");
      console.log(`  -> OK\n`);
    } catch (erro) {
      await client.query("ROLLBACK");
      console.error(`  -> ERRO: ${erro.message}`);
      console.error(`  -> Abortando. Corrija o problema e rode novamente.\n`);
      await client.end();
      process.exit(1);
    }
  }

  console.log("Todas as migrations executadas com sucesso!");
  await client.end();
}

rodarMigrations();
