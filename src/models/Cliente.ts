export class Cliente {
  private id?: number;
  private nome: string;
  private cpf: string;
  private email: string;
  private telefone: string;
  // campos para desconto (Parte 2)
  private torceFlamengo: boolean;
  private assisteOnePiece: boolean;
  private deSousa: boolean;

  constructor(
    nome: string,
    cpf: string,
    email: string,
    telefone: string,
    torceFlamengo: boolean = false,
    assisteOnePiece: boolean = false,
    deSousa: boolean = false,
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.cpf = cpf;
    this.email = email;
    this.telefone = telefone;
    this.torceFlamengo = torceFlamengo;
    this.assisteOnePiece = assisteOnePiece;
    this.deSousa = deSousa;
  }

  // getters
  getId(): number | undefined {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getCpf(): string {
    return this.cpf;
  }

  getEmail(): string {
    return this.email;
  }

  getTelefone(): string {
    return this.telefone;
  }

  getTorceFlamengo(): boolean {
    return this.torceFlamengo;
  }

  getAssisteOnePiece(): boolean {
    return this.assisteOnePiece;
  }

  getDeSousa(): boolean {
    return this.deSousa;
  }

  // setters
  setNome(novoNome: string): void {
    this.nome = novoNome;
  }

  setEmail(novoEmail: string): void {
    this.email = novoEmail;
  }

  setTelefone(novoTelefone: string): void {
    this.telefone = novoTelefone;
  }

  setTorceFlamengo(valor: boolean): void {
    this.torceFlamengo = valor;
  }

  setAssisteOnePiece(valor: boolean): void {
    this.assisteOnePiece = valor;
  }

  setDeSousa(valor: boolean): void {
    this.deSousa = valor;
  }

  // verifica se o cliente tem algum desconto
  temDesconto(): boolean {
    return this.torceFlamengo || this.assisteOnePiece || this.deSousa;
  }

  // converte para objeto simples (usado na API)
  toObject() {
    return {
      id: this.id,
      nome: this.nome,
      cpf: this.cpf,
      email: this.email,
      telefone: this.telefone,
      torceFlamengo: this.torceFlamengo,
      assisteOnePiece: this.assisteOnePiece,
      deSousa: this.deSousa,
    };
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `ID: ${this.id}` : "ID: (Nao atribuido)";
    console.log(`[Cliente ${idDisplay}] ${this.nome} | CPF: ${this.cpf} | Email: ${this.email} | Tel: ${this.telefone}`);
  }
}
