// Interfaces para o frontend (formato que a API retorna via toObject())

export interface Doce {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  fabricadoEmMari: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  torceFlamengo: boolean;
  assisteOnePiece: boolean;
  deSousa: boolean;
}

export interface Venda {
  id: number;
  clienteId: number;
  doceId: number;
  quantidade: number;
  valorTotal: number;
  dataVenda: string;
}
