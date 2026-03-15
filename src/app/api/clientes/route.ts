import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/clientes ou GET /api/clientes?nome=joao
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome");

  if (nome) {
    const resultado = gerenciador.buscarClientesPorNome(nome);
    return NextResponse.json(resultado);
  }

  return NextResponse.json(gerenciador.listarClientes());
}

// POST /api/clientes
export async function POST(request: Request) {
  const body = await request.json();
  const { nome, cpf, email, telefone, torceFlamengo, assisteOnePiece, deSousa } = body;

  if (!nome || !cpf || !email || !telefone) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const novo = gerenciador.cadastrarCliente(
    nome, cpf, email, telefone,
    torceFlamengo || false,
    assisteOnePiece || false,
    deSousa || false
  );
  return NextResponse.json(novo, { status: 201 });
}
