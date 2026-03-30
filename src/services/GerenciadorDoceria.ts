import pool from "../lib/db";

// remove tudo que nao e digito (usado pra normalizar cpf e telefone)
function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

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
    const cpfLimpo = somenteDigitos(cpf);
    const resultado = await pool.query(
      "SELECT * FROM clientes WHERE cpf = $1",
      [cpfLimpo]
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
    // normaliza cpf e telefone — salva so digitos no banco
    const cpfLimpo = somenteDigitos(cpf);
    const telLimpo = somenteDigitos(telefone);

    const resultado = await pool.query(
      `INSERT INTO clientes (nome, cpf, email, telefone, torce_flamengo, assiste_one_piece, de_sousa)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, cpfLimpo, email, telLimpo, torceFlamengo, assisteOnePiece, deSousa]
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
      valores.push(somenteDigitos(dados.telefone));
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

  // registra uma venda usando transacao (valida cliente, doce, vendedor, estoque)
  async registrarVenda(
    clienteId: number,
    doceId: number,
    vendedorId: number,
    quantidade: number,
    formaPagamento: "cartao" | "boleto" | "pix" | "berries" | "dinheiro",
    statusPagamento?: "confirmado" | "pendente" | "recusado"
  ) {
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

      // verifica se o vendedor existe
      const vendedorRes = await client.query(
        "SELECT id FROM vendedores WHERE id = $1",
        [vendedorId]
      );
      if (vendedorRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return "Vendedor nao encontrado";
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

      // calcula o valor total
      const valorTotal = parseFloat(doce.preco) * quantidade;

      // define o status do pagamento padrão se não for fornecido
      let finalStatusPagamento = statusPagamento;
      if (!finalStatusPagamento && ["cartao", "boleto", "pix", "berries"].includes(formaPagamento)) {
        finalStatusPagamento = "pendente";
      }

      // insere a venda
      const vendaRes = await client.query(
        `INSERT INTO vendas (cliente_id, doce_id, vendedor_id, quantidade, valor_total, forma_pagamento, status_pagamento)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [clienteId, doceId, vendedorId, quantidade, valorTotal, formaPagamento, finalStatusPagamento]
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

  // ==================== VENDEDORES ====================

  async listarVendedores() {
    const resultado = await pool.query("SELECT * FROM vendedores ORDER BY id");
    let vendedores = [];
    for (const row of resultado.rows) {
      vendedores.push(this.formatarVendedor(row));
    }
    return vendedores;
  }

  async buscarVendedorPorId(id: number) {
    const resultado = await pool.query("SELECT * FROM vendedores WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return null;
    return this.formatarVendedor(resultado.rows[0]);
  }

  async buscarVendedoresPorNome(nome: string) {
    const resultado = await pool.query(
      "SELECT * FROM vendedores WHERE LOWER(nome) LIKE $1 ORDER BY id",
      [`%${nome.toLowerCase()}%`]
    );
    let vendedores = [];
    for (const row of resultado.rows) {
      vendedores.push(this.formatarVendedor(row));
    }
    return vendedores;
  }

  async cadastrarVendedor(
    nome: string,
    email: string,
    telefone: string,
    cpf: string
  ) {
    const cpfLimpo = somenteDigitos(cpf);
    const telLimpo = somenteDigitos(telefone);

    const resultado = await pool.query(
      `INSERT INTO vendedores (nome, cpf, email, telefone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, cpfLimpo, email, telLimpo]
    );
    return this.formatarVendedor(resultado.rows[0]);
  }

  async atualizarVendedor(id: number, dados: {
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
  }) {
    const existe = await pool.query("SELECT id FROM vendedores WHERE id = $1", [id]);
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
      valores.push(somenteDigitos(dados.telefone));
    }
    if (dados.cpf !== undefined) {
      campos.push(`cpf = $${contador++}`);
      valores.push(somenteDigitos(dados.cpf));
    }

    if (campos.length === 0) return null;

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE vendedores SET ${campos.join(", ")} WHERE id = $${contador} RETURNING *`,
      valores
    );
    return this.formatarVendedor(resultado.rows[0]);
  }

  async removerVendedor(id: number): Promise<boolean> {
    const resultado = await pool.query("DELETE FROM vendedores WHERE id = $1", [id]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async contarVendedores(): Promise<number> {
    const resultado = await pool.query("SELECT COUNT(*) FROM vendedores");
    return parseInt(resultado.rows[0].count);
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
      vendedorId: row.vendedor_id,
      quantidade: row.quantidade,
      valorTotal: parseFloat(row.valor_total),
      dataVenda: new Date(row.data_venda).toLocaleDateString("pt-BR"),
      formaPagamento: row.forma_pagamento,
      statusPagamento: row.status_pagamento,
    };
  }

  private formatarVendedor(row: any) {
    return {
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      email: row.email,
      telefone: row.telefone,
    };
  }
}
