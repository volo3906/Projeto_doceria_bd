export class Venda {
  private id?: number;
  private clienteId: number;
  private doceId: number;
  private quantidade: number;
  private valorTotal: number;
  private dataVenda: string;

  constructor(
    clienteId: number,
    doceId: number,
    quantidade: number,
    valorTotal: number,
    dataVenda: string,
    id?: number
  ) {
    this.id = id;
    this.clienteId = clienteId;
    this.doceId = doceId;
    this.quantidade = quantidade;
    this.valorTotal = valorTotal;
    this.dataVenda = dataVenda;
  }

  getId(): number | undefined {
    return this.id;
  }

  getClienteId(): number {
    return this.clienteId;
  }

  getDoceId(): number {
    return this.doceId;
  }

  getQuantidade(): number {
    return this.quantidade;
  }

  getValorTotal(): number {
    return this.valorTotal;
  }

  getDataVenda(): string {
    return this.dataVenda;
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `ID: ${this.id}` : "ID: (Novo)";
    console.log(`[Venda ${idDisplay}] Data: ${this.dataVenda}`);
    console.log(` -> Cliente ID : ${this.clienteId}`);
    console.log(` -> Doce ID    : ${this.doceId}`);
    console.log(` -> Quantidade : ${this.quantidade} unid.`);
    console.log(` -> Total Pago : R$ ${this.valorTotal.toFixed(2)}`);
  }
}
