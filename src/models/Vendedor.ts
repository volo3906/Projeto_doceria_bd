export class Vendedor {
  private id?: number;
  private nome: string;
  private email: string;
  private telefone: string;
  private cpf: string;

  constructor(
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.cpf = cpf;
  }

  // getters
  getId(): number | undefined {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getEmail(): string {
    return this.email;
  }

  getTelefone(): string {
    return this.telefone;
  }

  getCpf(): string {
    return this.cpf;
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

  setCpf(novoCpf: string): void {
    this.cpf = novoCpf;
  }

  // converte para objeto simples (usado na API)
  toObject() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      cpf: this.cpf,
    };
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `ID: ${this.id}` : "ID: (Não atribuido)";
    console.log(`[Vendedor ${idDisplay}] ${this.nome} | CPF: ${this.cpf} | Email: ${this.email} | Tel: ${this.telefone}`);
  }
}
