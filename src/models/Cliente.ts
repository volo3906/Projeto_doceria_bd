export class Cliente {
  private id?: number; 
  private nome: string;
  private cpf: string;
  private email: string;

  constructor(nome: string, cpf: string, email: string, id?: number) {
    this.id = id;
    this.nome = nome;
    this.cpf = cpf;
    this.email = email;
  }

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

  setNome(novoNome: string): void {
    this.nome = novoNome;
  }

  setEmail(novoEmail: string): void {
    this.email = novoEmail;
  }

  exibirDetalhes(): void {
    const idDisplay = this.id ? `ID: ${this.id}` : "ID: (Não atribuído)";
    console.log(`[Cliente ${idDisplay}] ${this.nome} | CPF: ${this.cpf} | Email: ${this.email}`);
  }
}
