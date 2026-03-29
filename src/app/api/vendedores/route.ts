import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

function normalizarEFormatarCpf(raw: string) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return null;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}

// GET /api/vendedores
export async function GET() {
  return NextResponse.json(await gerenciador.listarVendedores());
}

// POST /api/vendedores
export async function POST(request: Request) {
  const body = await request.json();
  const { nome, email, telefone, cpf } = body;

  if (!nome || !email || !telefone || !cpf) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  // valida formato de email simples
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ erro: "Email invalido" }, { status: 400 });
  }

  const cpfFormatado = normalizarEFormatarCpf(cpf);
  if (!cpfFormatado) {
    return NextResponse.json({ erro: "CPF invalido (use 11 digitos ou formato 000.000.000-00)" }, { status: 400 });
  }

  try {
    const resultado = await gerenciador.cadastrarVendedor(nome, email, telefone, cpfFormatado);
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: any) {
    console.error('Erro ao cadastrar vendedor:', erro);
    if (erro && (erro.code === "23505" || erro.detail?.includes('cpf'))) {
      return NextResponse.json({ erro: "CPF ja cadastrado" }, { status: 400 });
    }
    const devMsg = process.env.NODE_ENV === 'production' ? 'Erro interno' : (erro?.message || String(erro));
    return NextResponse.json({ erro: devMsg }, { status: 500 });
  }
}
