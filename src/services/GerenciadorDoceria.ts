// Classe que gerencia todas as operacoes CRUD do sistema
// Usa as classes OOP (Doce, Cliente, Venda) internamente
// Retorna objetos simples para a API via toObject()

import { Doce } from "../models/Doce";
import { Cliente } from "../models/Cliente";
import { Venda } from "../models/Venda";

export class GerenciadorDoceria {
  private estoque: Doce[] = [];
  private clientes: Cliente[] = [];
  private historicoVendas: Venda[] = [];
  private proximoDoceId = 1;
  private proximoClienteId = 1;
  private proximoVendaId = 1;

  // ==================== DOCES ====================

  listarDoces() {
    let resultado = [];
    for (const d of this.estoque) {
      resultado.push(d.toObject());
    }
    return resultado;
  }

  buscarDocePorId(id: number): Doce | null {
    for (const d of this.estoque) {
      if (d.getId() === id) return d;
    }
    return null;
  }

  buscarDocesPorNome(nome: string) {
    const termo = nome.toLowerCase();
    let resultado = [];
    for (const d of this.estoque) {
      if (d.getNome().toLowerCase().includes(termo)) {
        resultado.push(d.toObject());
      }
    }
    return resultado;
  }

  buscarDocesPorCategoria(categoria: string) {
    let resultado = [];
    for (const d of this.estoque) {
      if (d.getCategoria().toLowerCase() === categoria.toLowerCase()) {
        resultado.push(d.toObject());
      }
    }
    return resultado;
  }

  cadastrarDoce(
    nome: string,
    categoria: string,
    preco: number,
    quantidade: number,
    fabricadoEmMari: boolean = false
  ) {
    const novo = new Doce(nome, categoria, preco, quantidade, fabricadoEmMari, this.proximoDoceId++);
    this.estoque.push(novo);
    return novo.toObject();
  }

  atualizarDoce(id: number, dados: {
    nome?: string;
    categoria?: string;
    preco?: number;
    estoque?: number;
    fabricadoEmMari?: boolean;
  }) {
    const doce = this.buscarDocePorId(id);
    if (!doce) return null;

    if (dados.nome !== undefined) doce.setNome(dados.nome);
    if (dados.categoria !== undefined) doce.setCategoria(dados.categoria);
    if (dados.preco !== undefined) doce.setPreco(dados.preco);
    if (dados.estoque !== undefined) doce.setQuantidade(dados.estoque);
    if (dados.fabricadoEmMari !== undefined) doce.setFabricadoEmMari(dados.fabricadoEmMari);

    return doce.toObject();
  }

  removerDoce(id: number): boolean {
    const index = this.estoque.findIndex((d) => d.getId() === id);
    if (index === -1) return false;
    this.estoque.splice(index, 1);
    return true;
  }

  contarDoces(): number {
    return this.estoque.length;
  }

  calcularValorEstoque(): number {
    let total = 0;
    for (const d of this.estoque) {
      total += d.getPreco() * d.getQuantidade();
    }
    return total;
  }

  // ==================== CLIENTES ====================

  listarClientes() {
    let resultado = [];
    for (const c of this.clientes) {
      resultado.push(c.toObject());
    }
    return resultado;
  }

  buscarClientePorId(id: number): Cliente | null {
    for (const c of this.clientes) {
      if (c.getId() === id) return c;
    }
    return null;
  }

  buscarClientesPorNome(nome: string) {
    const termo = nome.toLowerCase();
    let resultado = [];
    for (const c of this.clientes) {
      if (c.getNome().toLowerCase().includes(termo)) {
        resultado.push(c.toObject());
      }
    }
    return resultado;
  }

  buscarClientePorCpf(cpf: string): Cliente | null {
    for (const c of this.clientes) {
      if (c.getCpf() === cpf) return c;
    }
    return null;
  }

  cadastrarCliente(
    nome: string,
    cpf: string,
    email: string,
    telefone: string,
    torceFlamengo: boolean = false,
    assisteOnePiece: boolean = false,
    deSousa: boolean = false
  ) {
    const novo = new Cliente(
      nome, cpf, email, telefone,
      torceFlamengo, assisteOnePiece, deSousa,
      this.proximoClienteId++
    );
    this.clientes.push(novo);
    return novo.toObject();
  }

  atualizarCliente(id: number, dados: {
    nome?: string;
    email?: string;
    telefone?: string;
    torceFlamengo?: boolean;
    assisteOnePiece?: boolean;
    deSousa?: boolean;
  }) {
    const cliente = this.buscarClientePorId(id);
    if (!cliente) return null;

    if (dados.nome !== undefined) cliente.setNome(dados.nome);
    if (dados.email !== undefined) cliente.setEmail(dados.email);
    if (dados.telefone !== undefined) cliente.setTelefone(dados.telefone);
    if (dados.torceFlamengo !== undefined) cliente.setTorceFlamengo(dados.torceFlamengo);
    if (dados.assisteOnePiece !== undefined) cliente.setAssisteOnePiece(dados.assisteOnePiece);
    if (dados.deSousa !== undefined) cliente.setDeSousa(dados.deSousa);

    return cliente.toObject();
  }

  removerCliente(id: number): boolean {
    const index = this.clientes.findIndex((c) => c.getId() === id);
    if (index === -1) return false;
    this.clientes.splice(index, 1);
    return true;
  }

  contarClientes(): number {
    return this.clientes.length;
  }

  // ==================== VENDAS ====================

  listarVendas() {
    let resultado = [];
    for (const v of this.historicoVendas) {
      resultado.push(v.toObject());
    }
    return resultado;
  }

  buscarVendaPorId(id: number): Venda | null {
    for (const v of this.historicoVendas) {
      if (v.getId() === id) return v;
    }
    return null;
  }

  buscarVendasPorCliente(clienteId: number) {
    let resultado = [];
    for (const v of this.historicoVendas) {
      if (v.getClienteId() === clienteId) {
        resultado.push(v.toObject());
      }
    }
    return resultado;
  }

  // registra uma venda, validando cliente, doce e estoque
  registrarVenda(clienteId: number, doceId: number, quantidade: number) {
    const cliente = this.buscarClientePorId(clienteId);
    if (!cliente) return "Cliente nao encontrado";

    const doce = this.buscarDocePorId(doceId);
    if (!doce) return "Doce nao encontrado";

    // usa o metodo vender() da classe Doce (verifica e desconta estoque)
    if (!doce.vender(quantidade)) return "Estoque insuficiente";

    const valorTotal = doce.getPreco() * quantidade;
    const nova = new Venda(
      clienteId, doceId, quantidade, valorTotal,
      new Date().toLocaleDateString("pt-BR"),
      this.proximoVendaId++
    );
    this.historicoVendas.push(nova);
    return nova.toObject();
  }

  contarVendas(): number {
    return this.historicoVendas.length;
  }

  calcularTotalVendido(): number {
    let total = 0;
    for (const v of this.historicoVendas) {
      total += v.getValorTotal();
    }
    return total;
  }

  // ==================== RELATORIOS ====================

  gerarRelatorio() {
    return {
      totalDoces: this.contarDoces(),
      totalClientes: this.contarClientes(),
      totalVendas: this.contarVendas(),
      valorEstoque: this.calcularValorEstoque(),
      totalVendido: this.calcularTotalVendido(),
    };
  }
}
