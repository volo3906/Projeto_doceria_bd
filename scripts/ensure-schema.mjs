import { Pool } from "pg";
import fs from "fs";
import path from "path";

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      obj[m[1]] = val;
    }
  }
  return obj;
}

async function run() {
  const repoRoot = path.resolve('.');
  const env = loadEnv(path.join(repoRoot, '.env.local'));
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL não encontrado.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    console.log('Verificando existência da tabela vendedores...');
    const tRes = await client.query("SELECT to_regclass('public.vendedores') as reg");
    if (!tRes.rows[0].reg) {
      console.log('Criando tabela vendedores...');
      await client.query(`CREATE TABLE IF NOT EXISTS vendedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT NOW()
      )`);
      console.log('Tabela vendedores criada.');
    } else {
      console.log('Tabela vendedores já existe.');
    }

    // garante que exista a coluna cpf em vendedores
    const cpfCol = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='vendedores' AND column_name='cpf'
    `);
    if (cpfCol.rowCount === 0) {
      console.log('Adicionando coluna cpf em vendedores...');
      try {
        await client.query(`ALTER TABLE vendedores ADD COLUMN cpf VARCHAR(14)`);
        try {
          await client.query(`ALTER TABLE vendedores ADD CONSTRAINT vendedores_cpf_unique UNIQUE (cpf)`);
        } catch (e) {
          console.warn('Falha ao adicionar constraint UNIQUE em cpf (pode já existir):', e.message || e);
        }
        console.log('Coluna cpf adicionada em vendedores.');
      } catch (e) {
        console.warn('Falha ao adicionar coluna cpf em vendedores:', e.message || e);
      }
    } else {
      console.log('Coluna cpf em vendedores já existe.');
    }

    // adiciona coluna vendedor_id em vendas se não existir
    const colRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='vendas' AND column_name='vendedor_id'
    `);
    if (colRes.rowCount === 0) {
      console.log('Adicionando coluna vendedor_id em vendas...');
      await client.query(`ALTER TABLE vendas ADD COLUMN vendedor_id INTEGER`);
      try {
        await client.query(`ALTER TABLE vendas ADD CONSTRAINT vendas_vendedor_fk FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE RESTRICT`);
      } catch (e) {
        console.warn('Falha ao adicionar constraint de FK (pode já existir):', e.message || e);
      }
      console.log('Coluna vendedor_id adicionada.');
    } else {
      console.log('Coluna vendedor_id já existe.');
    }

    // forma_pagamento
    const formaRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='vendas' AND column_name='forma_pagamento'
    `);
    if (formaRes.rowCount === 0) {
      console.log('Adicionando coluna forma_pagamento em vendas...');
      await client.query(`ALTER TABLE vendas ADD COLUMN forma_pagamento VARCHAR(20)`);
      try {
        await client.query(`ALTER TABLE vendas ADD CONSTRAINT vendas_forma_check CHECK (forma_pagamento IN ('cartao','boleto','pix','berries','dinheiro'))`);
      } catch (e) {
        console.warn('Falha ao adicionar constraint de forma_pagamento:', e.message || e);
      }
      console.log('Coluna forma_pagamento adicionada.');
    } else {
      console.log('Coluna forma_pagamento já existe.');
    }

    // status_pagamento
    const statusRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='vendas' AND column_name='status_pagamento'
    `);
    if (statusRes.rowCount === 0) {
      console.log('Adicionando coluna status_pagamento em vendas...');
      await client.query(`ALTER TABLE vendas ADD COLUMN status_pagamento VARCHAR(20)`);
      try {
        await client.query(`ALTER TABLE vendas ADD CONSTRAINT vendas_status_check CHECK (status_pagamento IN ('confirmado','pendente','recusado'))`);
      } catch (e) {
        console.warn('Falha ao adicionar constraint de status_pagamento:', e.message || e);
      }
      console.log('Coluna status_pagamento adicionada.');
    } else {
      console.log('Coluna status_pagamento já existe.');
    }

    console.log('Schema verificado/atualizado com sucesso.');
  } catch (err) {
    console.error('Erro durante verificação/atualização do schema:', err.message || err);
    process.exitCode = 2;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
