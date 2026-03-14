import { Doce } from "../models/Doce";
import { Venda } from "../models/Venda";
import { Cliente } from "../models/Cliente";

export class GerenciadorDoceria {
  private estoque: Doce[] = [];
  private historicoVendas: Venda[] = [];
  private clientes: Cliente[] = [];

  private proximoId: number = 1;
  private proximaVendaId: number = 1;
  private proximoClienteId: number = 1;

  constructor() {}

  criarDoce(nome: string, categoria: string, preco: number, qtd: number): void {
    const novoDoce = new Doce(nome, categoria, preco, qtd, this.proximoId++);
    this.estoque.push(novoDoce);
    console.log(`-> Doce '${nome}' cadastrado com ID ${this.proximoId - 1}.`);
  }

  lerDoce(id: number): Doce | null {
    for (const d of this.estoque) {
      if (d.getId() === id) {
        return d;
      }
    }
    return null;
  }

  listarTodos(): void {
    if (this.estoque.length === 0) {
      console.log("\n[Aviso] O estoque esta totalmente vazio.");
      return;
    }
    console.log("\n--- LISTAGEM DE ESTOQUE ---");
    for (const d of this.estoque) {
      d.exibirDetalhes();
    }
  }

  atualizarDoce(id: number, novoPreco: number, novaQtd: number): boolean {
    const d = this.lerDoce(id);
    if (d) {
      d.setPreco(novoPreco);
      d.setQuantidade(novaQtd);
      return true;
    }
    return false;
  }

  deletarDoce(id: number): boolean {
    const index = this.estoque.findIndex((d) => d.getId() === id);
    if (index !== -1) {
      console.log(`-> Removendo: ${this.estoque[index].getNome()} do sistema.`);
      this.estoque.splice(index, 1);
      return true;
    }
    return false;
  }

  buscarPorCategoria(categoria: string): void {
    console.log(`\n--- CATEGORIA: ${categoria} ---`);
    let encontrou = false;
    for (const d of this.estoque) {
      if (d.getCategoria() === categoria) {
        d.exibirDetalhes();
        encontrou = true;
      }
    }
    if (!encontrou) console.log("Nenhum doce encontrado nesta categoria.");
  }

  registrarVenda(clienteId: number, doceId: number, qtd: number, data: string): void {
    if (this.buscarCliente(clienteId) === null) {
      console.log(`-> Erro: Cliente ID ${clienteId} nao encontrado!`);
      return;
    }

    const d = this.lerDoce(doceId);
    if (d !== null) {
      if (d.vender(qtd)) {
        const total = d.getPreco() * qtd;
        const novaVenda = new Venda(
          clienteId,
          doceId,
          qtd,
          total,
          data,
          this.proximaVendaId++
        );
        this.historicoVendas.push(novaVenda);
        console.log("-> Sucesso: Venda registada para o cliente!");
      } else {
        console.log("-> Erro: Estoque insuficiente.");
      }
    } else {
      console.log(`-> Erro: Doce ID ${doceId} nao encontrado.`);
    }
  }

  exibirRelatorioFinanceiro(): void {
    let valorEstoque = 0;
    let totalArrecadado = 0;

    for (const d of this.estoque) {
      valorEstoque += d.getPreco() * d.getQuantidade();
    }

    for (const v of this.historicoVendas) {
      totalArrecadado += v.getValorTotal();
    }

    console.log("\n====================================");
    console.log("     RELATORIO GERAL DA DOCERIA     ");
    console.log("====================================");
    console.log(`VALOR EM ESTOQUE  : R$ ${valorEstoque.toFixed(2)}`);
    console.log(`TOTAL EM VENDAS   : R$ ${totalArrecadado.toFixed(2)}`);
    console.log(`QUANTIDADE VENDAS : ${this.historicoVendas.length}`);
    console.log("====================================\n");
  }

  cadastrarCliente(nome: string, cpf: string, email: string): void {
    const novoCliente = new Cliente(nome, cpf, email, this.proximoClienteId++);
    this.clientes.push(novoCliente);
    console.log(`-> Cliente '${nome}' cadastrado!`);
  }

  listarClientes(): void {
    if (this.clientes.length === 0) {
      console.log("\n[Aviso] Nenhum cliente cadastrado.");
      return;
    }
    console.log("\n--- LISTA DE CLIENTES ---");
    for (const c of this.clientes) {
      c.exibirDetalhes();
    }
  }

  buscarCliente(id: number): Cliente | null {
    for (const c of this.clientes) {
      if (c.getId() === id) return c;
    }
    return null;
  }
}
