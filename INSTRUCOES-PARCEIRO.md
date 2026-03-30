# Instrucoes para o Parceiro — Migracao PostgreSQL

> Este documento contem TODOS os arquivos que o parceiro precisa criar/substituir na maquina dele.
> Apos copiar, ele faz 2 commits separados.

---

## Pre-requisitos

1. `git pull` — puxar o commit do Johan (Docker + schema + db.ts)
2. `npm install` — instalar pg + @types/pg (novas dependencias)
3. Copiar `.env.example` para `.env`
4. Editar `.env` com as credenciais reais:

```
POSTGRES_DB=doceria
POSTGRES_USER=doceria
POSTGRES_PASSWORD=06f4e3a9cbf3f901db7f840e5f3da86dd08baa46
DATABASE_URL=postgresql://doceria:06f4e3a9cbf3f901db7f840e5f3da86dd08baa46@178.156.217.151:5433/doceria
```

5. `npm run dev` — testar se conecta no banco

---

## Commit 1: `feat(db): migrar GerenciadorDoceria para PostgreSQL`

### Arquivo 1/8: src/services/GerenciadorDoceria.ts

**SUBSTITUIR O ARQUIVO INTEIRO** pelo conteudo abaixo:

```typescript
// Classe que gerencia todas as operacoes CRUD do sistema
// Conecta no PostgreSQL e retorna objetos formatados para a API

import pool from "../lib/db";

export class GerenciadorDoceria {

  // ==================== DOCES ====================

  async listarDoces() {
    const resultado = await pool.query("SELECT * FROM doces ORDER BY id");
    let doces = [];
    for (const row of resultado.rows) {
      doces.push(this.formatarDoce(row));
    }
    return doces;
  }

  async buscarDocePorId(id: number) {
    const resultado = await pool.query("SELECT * FROM doces WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return null;
    return this.formatarDoce(resultado.rows[0]);
  }

  async buscarDocesPorNome(nome: string) {
    const resultado = await pool.query(
      "SELECT * FROM doces WHERE LOWER(nome) LIKE $1 ORDER BY id",
      [`%${nome.toLowerCase()}%`]
    );
    let doces = [];
    for (const row of resultado.rows) {
      doces.push(this.formatarDoce(row));
    }
    return doces;
  }

  async buscarDocesPorCategoria(categoria: string) {
    const resultado = await pool.query(
      "SELECT * FROM doces WHERE LOWER(categoria) = $1 ORDER BY id",
      [categoria.toLowerCase()]
    );
    let doces = [];
    for (const row of resultado.rows) {
      doces.push(this.formatarDoce(row));
    }
    return doces;
  }

  async cadastrarDoce(
    nome: string,
    categoria: string,
    preco: number,
    quantidade: number,
    fabricadoEmMari: boolean = false
  ) {
    const resultado = await pool.query(
      `INSERT INTO doces (nome, categoria, preco, estoque, fabricado_em_mari)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, categoria, preco, quantidade, fabricadoEmMari]
    );
    return this.formatarDoce(resultado.rows[0]);
  }

  async atualizarDoce(id: number, dados: {
    nome?: string;
    categoria?: string;
    preco?: number;
    estoque?: number;
    fabricadoEmMari?: boolean;
  }) {
    // primeiro verifica se existe
    const existe = await pool.query("SELECT id FROM doces WHERE id = $1", [id]);
    if (existe.rows.length === 0) return null;

    // monta o UPDATE com os campos que vieram
    const campos: string[] = [];
    const valores: any[] = [];
    let contador = 1;

    if (dados.nome !== undefined) {
      campos.push(`nome = $${contador++}`);
      valores.push(dados.nome);
    }
    if (dados.categoria !== undefined) {
      campos.push(`categoria = $${contador++}`);
      valores.push(dados.categoria);
    }
    if (dados.preco !== undefined) {
      campos.push(`preco = $${contador++}`);
      valores.push(dados.preco);
    }
    if (dados.estoque !== undefined) {
      campos.push(`estoque = $${contador++}`);
      valores.push(dados.estoque);
    }
    if (dados.fabricadoEmMari !== undefined) {
      campos.push(`fabricado_em_mari = $${contador++}`);
      valores.push(dados.fabricadoEmMari);
    }

    if (campos.length === 0) return null;

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE doces SET ${campos.join(", ")} WHERE id = $${contador} RETURNING *`,
      valores
    );
    return this.formatarDoce(resultado.rows[0]);
  }

  async removerDoce(id: number): Promise<boolean> {
    const resultado = await pool.query("DELETE FROM doces WHERE id = $1", [id]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async contarDoces(): Promise<number> {
    const resultado = await pool.query("SELECT COUNT(*) FROM doces");
    return parseInt(resultado.rows[0].count);
  }

  async calcularValorEstoque(): Promise<number> {
    const resultado = await pool.query(
      "SELECT COALESCE(SUM(preco * estoque), 0) as total FROM doces"
    );
    return parseFloat(resultado.rows[0].total);
  }

  // ==================== CLIENTES ====================

  async listarClientes() {
    const resultado = await pool.query("SELECT * FROM clientes ORDER BY id");
    let clientes = [];
    for (const row of resultado.rows) {
      clientes.push(this.formatarCliente(row));
    }
    return clientes;
  }

  async buscarClientePorId(id: number) {
    const resultado = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return null;
    return this.formatarCliente(resultado.rows[0]);
  }

  async buscarClientesPorNome(nome: string) {
    const resultado = await pool.query(
      "SELECT * FROM clientes WHERE LOWER(nome) LIKE $1 ORDER BY id",
      [`%${nome.toLowerCase()}%`]
    );
    let clientes = [];
    for (const row of resultado.rows) {
      clientes.push(this.formatarCliente(row));
    }
    return clientes;
  }

  async buscarClientePorCpf(cpf: string) {
    const resultado = await pool.query(
      "SELECT * FROM clientes WHERE cpf = $1",
      [cpf]
    );
    if (resultado.rows.length === 0) return null;
    return this.formatarCliente(resultado.rows[0]);
  }

  async cadastrarCliente(
    nome: string,
    cpf: string,
    email: string,
    telefone: string,
    torceFlamengo: boolean = false,
    assisteOnePiece: boolean = false,
    deSousa: boolean = false
  ) {
    const resultado = await pool.query(
      `INSERT INTO clientes (nome, cpf, email, telefone, torce_flamengo, assiste_one_piece, de_sousa)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, cpf, email, telefone, torceFlamengo, assisteOnePiece, deSousa]
    );
    return this.formatarCliente(resultado.rows[0]);
  }

  async atualizarCliente(id: number, dados: {
    nome?: string;
    email?: string;
    telefone?: string;
    torceFlamengo?: boolean;
    assisteOnePiece?: boolean;
    deSousa?: boolean;
  }) {
    const existe = await pool.query("SELECT id FROM clientes WHERE id = $1", [id]);
    if (existe.rows.length === 0) return null;

    const campos: string[] = [];
    const valores: any[] = [];
    let contador = 1;

    if (dados.nome !== undefined) {
      campos.push(`nome = $${contador++}`);
      valores.push(dados.nome);
    }
    if (dados.email !== undefined) {
      campos.push(`email = $${contador++}`);
      valores.push(dados.email);
    }
    if (dados.telefone !== undefined) {
      campos.push(`telefone = $${contador++}`);
      valores.push(dados.telefone);
    }
    if (dados.torceFlamengo !== undefined) {
      campos.push(`torce_flamengo = $${contador++}`);
      valores.push(dados.torceFlamengo);
    }
    if (dados.assisteOnePiece !== undefined) {
      campos.push(`assiste_one_piece = $${contador++}`);
      valores.push(dados.assisteOnePiece);
    }
    if (dados.deSousa !== undefined) {
      campos.push(`de_sousa = $${contador++}`);
      valores.push(dados.deSousa);
    }

    if (campos.length === 0) return null;

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE clientes SET ${campos.join(", ")} WHERE id = $${contador} RETURNING *`,
      valores
    );
    return this.formatarCliente(resultado.rows[0]);
  }

  async removerCliente(id: number): Promise<boolean> {
    const resultado = await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async contarClientes(): Promise<number> {
    const resultado = await pool.query("SELECT COUNT(*) FROM clientes");
    return parseInt(resultado.rows[0].count);
  }

  // ==================== VENDAS ====================

  async listarVendas() {
    const resultado = await pool.query("SELECT * FROM vendas ORDER BY id");
    let vendas = [];
    for (const row of resultado.rows) {
      vendas.push(this.formatarVenda(row));
    }
    return vendas;
  }

  async buscarVendaPorId(id: number) {
    const resultado = await pool.query("SELECT * FROM vendas WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return null;
    return this.formatarVenda(resultado.rows[0]);
  }

  async buscarVendasPorCliente(clienteId: number) {
    const resultado = await pool.query(
      "SELECT * FROM vendas WHERE cliente_id = $1 ORDER BY id",
      [clienteId]
    );
    let vendas = [];
    for (const row of resultado.rows) {
      vendas.push(this.formatarVenda(row));
    }
    return vendas;
  }

  // registra uma venda usando transacao (valida cliente, doce, estoque)
  async registrarVenda(clienteId: number, doceId: number, quantidade: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // verifica se o cliente existe
      const clienteRes = await client.query(
        "SELECT id FROM clientes WHERE id = $1",
        [clienteId]
      );
      if (clienteRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return "Cliente nao encontrado";
      }

      // busca o doce e trava a linha pra ninguem mexer enquanto processa
      const doceRes = await client.query(
        "SELECT * FROM doces WHERE id = $1 FOR UPDATE",
        [doceId]
      );
      if (doceRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return "Doce nao encontrado";
      }

      const doce = doceRes.rows[0];

      // verifica estoque
      if (doce.estoque < quantidade) {
        await client.query("ROLLBACK");
        return "Estoque insuficiente";
      }

      // desconta o estoque
      await client.query(
        "UPDATE doces SET estoque = estoque - $1 WHERE id = $2",
        [quantidade, doceId]
      );

      // calcula o valor total e insere a venda
      const valorTotal = parseFloat(doce.preco) * quantidade;
      const vendaRes = await client.query(
        `INSERT INTO vendas (cliente_id, doce_id, quantidade, valor_total)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [clienteId, doceId, quantidade, valorTotal]
      );

      await client.query("COMMIT");
      return this.formatarVenda(vendaRes.rows[0]);
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  }

  async contarVendas(): Promise<number> {
    const resultado = await pool.query("SELECT COUNT(*) FROM vendas");
    return parseInt(resultado.rows[0].count);
  }

  async calcularTotalVendido(): Promise<number> {
    const resultado = await pool.query(
      "SELECT COALESCE(SUM(valor_total), 0) as total FROM vendas"
    );
    return parseFloat(resultado.rows[0].total);
  }

  // ==================== RELATORIOS ====================

  async gerarRelatorio() {
    // faz todas as queries em paralelo pra ser mais rapido
    const [doces, clientes, vendas, estoque, vendido] = await Promise.all([
      this.contarDoces(),
      this.contarClientes(),
      this.contarVendas(),
      this.calcularValorEstoque(),
      this.calcularTotalVendido(),
    ]);

    return {
      totalDoces: doces,
      totalClientes: clientes,
      totalVendas: vendas,
      valorEstoque: estoque,
      totalVendido: vendido,
    };
  }

  // ==================== HELPERS ====================

  // converte uma row do banco pro formato que a API espera (snake_case -> camelCase)
  private formatarDoce(row: any) {
    return {
      id: row.id,
      nome: row.nome,
      categoria: row.categoria,
      preco: parseFloat(row.preco),
      estoque: row.estoque,
      fabricadoEmMari: row.fabricado_em_mari,
    };
  }

  private formatarCliente(row: any) {
    return {
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      email: row.email,
      telefone: row.telefone,
      torceFlamengo: row.torce_flamengo,
      assisteOnePiece: row.assiste_one_piece,
      deSousa: row.de_sousa,
    };
  }

  private formatarVenda(row: any) {
    return {
      id: row.id,
      clienteId: row.cliente_id,
      doceId: row.doce_id,
      quantidade: row.quantidade,
      valorTotal: parseFloat(row.valor_total),
      dataVenda: new Date(row.data_venda).toLocaleDateString("pt-BR"),
    };
  }
}
```

---

### Arquivo 2/8: src/lib/dados.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
// singleton do gerenciador — agora conecta no PostgreSQL
import { GerenciadorDoceria } from "../services/GerenciadorDoceria";

const gerenciador = new GerenciadorDoceria();

export default gerenciador;
```

---

### Arquivo 3/8: src/app/api/doces/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/doces ou GET /api/doces?nome=brigadeiro
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome");

  if (nome) {
    const resultado = await gerenciador.buscarDocesPorNome(nome);
    return NextResponse.json(resultado);
  }

  return NextResponse.json(await gerenciador.listarDoces());
}

// POST /api/doces
export async function POST(request: Request) {
  const body = await request.json();
  const { nome, categoria, preco, estoque, fabricadoEmMari } = body;

  if (!nome || !categoria || preco === undefined || estoque === undefined) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const novo = await gerenciador.cadastrarDoce(
    nome, categoria, Number(preco), Number(estoque), fabricadoEmMari || false
  );
  return NextResponse.json(novo, { status: 201 });
}
```

---

### Arquivo 4/8: src/app/api/doces/[id]/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/doces/1
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doce = await gerenciador.buscarDocePorId(Number(id));
  if (!doce) {
    return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(doce);
}

// PUT /api/doces/1
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const atualizado = await gerenciador.atualizarDoce(Number(id), body);
  if (!atualizado) {
    return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(atualizado);
}

// DELETE /api/doces/1
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const removido = await gerenciador.removerDoce(Number(id));
    if (!removido) {
      return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Removido com sucesso" });
  } catch (erro: any) {
    if (erro.code === "23503") {
      return NextResponse.json(
        { erro: "Nao e possivel remover: este doce tem vendas associadas" },
        { status: 400 }
      );
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
```

---

### Arquivo 5/8: src/app/api/clientes/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/clientes ou GET /api/clientes?nome=joao
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome");

  if (nome) {
    const resultado = await gerenciador.buscarClientesPorNome(nome);
    return NextResponse.json(resultado);
  }

  return NextResponse.json(await gerenciador.listarClientes());
}

// POST /api/clientes
export async function POST(request: Request) {
  const body = await request.json();
  const { nome, cpf, email, telefone, torceFlamengo, assisteOnePiece, deSousa } = body;

  if (!nome || !cpf || !email || !telefone) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  try {
    const novo = await gerenciador.cadastrarCliente(
      nome, cpf, email, telefone,
      torceFlamengo || false,
      assisteOnePiece || false,
      deSousa || false
    );
    return NextResponse.json(novo, { status: 201 });
  } catch (erro: any) {
    if (erro.code === "23505") {
      return NextResponse.json({ erro: "CPF ja cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
```

---

### Arquivo 6/8: src/app/api/clientes/[id]/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/clientes/1
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await gerenciador.buscarClientePorId(Number(id));
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(cliente);
}

// PUT /api/clientes/1
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const atualizado = await gerenciador.atualizarCliente(Number(id), body);
  if (!atualizado) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(atualizado);
}

// DELETE /api/clientes/1
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const removido = await gerenciador.removerCliente(Number(id));
    if (!removido) {
      return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Removido com sucesso" });
  } catch (erro: any) {
    if (erro.code === "23503") {
      return NextResponse.json(
        { erro: "Nao e possivel remover: este cliente tem vendas associadas" },
        { status: 400 }
      );
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
```

---

### Arquivo 7/8: src/app/api/vendas/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/vendas
export async function GET() {
  return NextResponse.json(await gerenciador.listarVendas());
}

// POST /api/vendas
export async function POST(request: Request) {
  const body = await request.json();
  const { clienteId, doceId, quantidade } = body;

  if (!clienteId || !doceId || !quantidade) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const resultado = await gerenciador.registrarVenda(Number(clienteId), Number(doceId), Number(quantidade));

  // se retornou string, eh uma mensagem de erro
  if (typeof resultado === "string") {
    return NextResponse.json({ erro: resultado }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: 201 });
}
```

---

### Arquivo 8/8: src/app/api/relatorio/route.ts

**SUBSTITUIR O ARQUIVO INTEIRO:**

```typescript
import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/relatorio
export async function GET() {
  return NextResponse.json(await gerenciador.gerarRelatorio());
}
```

---

## Comandos para commitar

Apos copiar todos os 8 arquivos:

```bash
git add src/services/GerenciadorDoceria.ts src/lib/dados.ts src/app/api/doces/route.ts src/app/api/doces/\[id\]/route.ts src/app/api/clientes/route.ts src/app/api/clientes/\[id\]/route.ts src/app/api/vendas/route.ts src/app/api/relatorio/route.ts
git commit -m "feat(db): migrar GerenciadorDoceria para PostgreSQL"
git push
```

---

## Teste rapido apos commitar

```bash
npm run dev
```

Abrir no navegador: http://localhost:3303

- Dashboard deve mostrar 5 doces, 3 clientes
- Cadastrar um doce novo → recarregar → dado persiste
- Registrar uma venda → estoque diminui
- Parar o servidor (Ctrl+C) e reiniciar → dados continuam la
