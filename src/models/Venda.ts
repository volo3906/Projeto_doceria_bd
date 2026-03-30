export class Venda {
  private id?: number;
  private clienteId: number;
  private doceId: number;
  private vendedorId: number;
  private quantidade: number;
  private valorTotal: number;
  private dataVenda: string;
  private formaPagamento: "cartao" | "boleto" | "pix" | "berries" | "dinheiro";
  private statusPagamento?: "confirmado" | "pendente" | "recusado";

  constructor(
    clienteId: number,
    doceId: number,
    vendedorId: number,
    quantidade: number,
    valorTotal: number,
    dataVenda: string,
    formaPagamento: "cartao" | "boleto" | "pix" | "berries" | "dinheiro",
    statusPagamento?: "confirmado" | "pendente" | "recusado",
    id?: number
  ) {
    this.id = id;
    this.clienteId = clienteId;
    this.doceId = doceId;
    this.vendedorId = vendedorId;
    this.quantidade = quantidade;
    this.valorTotal = valorTotal;
    this.dataVenda = dataVenda;
    this.formaPagamento = formaPagamento;
    this.statusPagamento = statusPagamento || (
      ["cartao", "boleto", "pix", "berries"].includes(formaPagamento) ? "pendente" : undefined
    );
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

  getVendedorId(): number {
    return this.vendedorId;
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

  getFormaPagamento(): "cartao" | "boleto" | "pix" | "berries" | "dinheiro" {
    return this.formaPagamento;
  }

  getStatusPagamento(): "confirmado" | "pendente" | "recusado" | undefined {
    return this.statusPagamento;
  }

  // converte para objeto simples (usado na API)
  toObject() {
    return {
      id: this.id,
      clienteId: this.clienteId,
      doceId: this.doceId,
      vendedorId: this.vendedorId,
      quantidade: this.quantidade,
      valorTotal: this.valorTotal,
      dataVenda: this.dataVenda,
      formaPagamento: this.formaPagamento,
      statusPagamento: this.statusPagamento,
    };
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `ID: ${this.id}` : "ID: (Novo)";
    console.log(`[Venda ${idDisplay}] Data: ${this.dataVenda}`);
    console.log(` -> Cliente ID : ${this.clienteId}`);
    console.log(` -> Doce ID    : ${this.doceId}`);
    console.log(` -> Vendedor ID: ${this.vendedorId}`);
    console.log(` -> Quantidade : ${this.quantidade} unid.`);
    console.log(` -> Total Pago : R$ ${this.valorTotal.toFixed(2)}`);
    console.log(` -> Forma de Pagamento: ${this.formaPagamento}`);
    if (this.statusPagamento) {
      console.log(` -> Status do Pagamento: ${this.statusPagamento}`);
    }
  }
}
