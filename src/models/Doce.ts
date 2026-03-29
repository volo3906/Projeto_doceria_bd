export class Doce {
  private id?: number;
  private nome: string;
  private categoria: string;
  private preco: number;
  private quantidadeEstoque: number;
  private fabricadoEmMari: boolean;

  constructor(
    nome: string,
    categoria: string,
    preco: number,
    quantidade: number,
    fabricadoEmMari: boolean = false,
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.preco = preco;
    this.quantidadeEstoque = quantidade;
    this.fabricadoEmMari = fabricadoEmMari;
  }

  // getters
  getId(): number | undefined {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getCategoria(): string {
    return this.categoria;
  }

  getPreco(): number {
    return this.preco;
  }

  getQuantidade(): number {
    return this.quantidadeEstoque;
  }

  getFabricadoEmMari(): boolean {
    return this.fabricadoEmMari;
  }

  // setters
  setNome(novoNome: string): void {
    this.nome = novoNome;
  }

  setCategoria(novaCategoria: string): void {
    this.categoria = novaCategoria;
  }

  setPreco(novoPreco: number): void {
    if (novoPreco >= 0) {
      this.preco = novoPreco;
    }
  }

  setQuantidade(novaQuantidade: number): void {
    if (novaQuantidade >= 0) {
      this.quantidadeEstoque = novaQuantidade;
    }
  }

  setFabricadoEmMari(valor: boolean): void {
    this.fabricadoEmMari = valor;
  }

  // converte para objeto simples (usado na API)
  toObject() {
    return {
      id: this.id,
      nome: this.nome,
      categoria: this.categoria,
      preco: this.preco,
      estoque: this.quantidadeEstoque,
      fabricadoEmMari: this.fabricadoEmMari,
    };
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `${this.id}` : "(Novo)";
    console.log(
      `[${idDisplay}] ${this.nome} (${this.categoria}) - Preco: R$ ${this.preco.toFixed(2)} | Estoque: ${this.quantidadeEstoque} unid.`
    );
  }

  aplicarDesconto(porcentagem: number): void {
    if (porcentagem > 0 && porcentagem <= 100) {
      this.preco -= this.preco * (porcentagem / 100.0);
      console.log(`-> Desconto de ${porcentagem}% aplicado ao produto ${this.nome}.`);
    }
  }

  vender(quantidade: number): boolean {
    if (quantidade > 0 && this.quantidadeEstoque >= quantidade) {
      this.quantidadeEstoque -= quantidade;
      return true;
    }
    return false;
  }

  reabastecer(quantidade: number): void {
    if (quantidade > 0) {
      this.quantidadeEstoque += quantidade;
      console.log(`-> Reabastecimento de ${quantidade} unidades feito com sucesso.`);
    }
  }
}
