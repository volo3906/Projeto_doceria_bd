import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// remove tudo que nao e digito
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// formata CPF pra exibicao: 12345678900 → 123.456.789-00
export function formatarCpf(cpf: string): string {
  const digitos = somenteDigitos(cpf);
  if (digitos.length !== 11) return cpf;
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// mascara de CPF enquanto digita
export function mascaraCpf(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return digitos.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digitos.length <= 9) return digitos.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

// formata telefone pra exibicao: 5583999990001 → +55 (83) 99999-0001
export function formatarTelefone(tel: string): string {
  const digitos = somenteDigitos(tel);
  if (digitos.length === 13) {
    return digitos.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
  }
  if (digitos.length === 11) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return tel;
}

// mascara de telefone enquanto digita
export function mascaraTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 13);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return digitos.replace(/(\d{2})(\d+)/, "+$1 ($2");
  if (digitos.length <= 9) return digitos.replace(/(\d{2})(\d{2})(\d+)/, "+$1 ($2) $3");
  return digitos.replace(/(\d{2})(\d{2})(\d{5})(\d+)/, "+$1 ($2) $3-$4");
}

// formata preco em reais: 4.5 → "R$ 4,50"
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// converte input de preco aceitando virgula ou ponto: "10,50" ou "10.50" → 10.5
export function parsearPreco(valor: string): number {
  // troca virgula por ponto pra poder converter
  const limpo = valor.replace(",", ".");
  return parseFloat(limpo) || 0;
}
