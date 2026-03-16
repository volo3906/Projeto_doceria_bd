import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/doces ou GET /api/doces?nome=brigadeiro
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome");

  if (nome) {
    const resultado = await gerenciador.buscarDocesPorNome(nome);
    return NextResponse.json(resultado);
  }

  return NextResponse.json(await gerenciador.listarDoces());
}

// POST /api/doces
export async function POST(request: Request) {
  const body = await request.json();
  const { nome, categoria, preco, estoque, fabricadoEmMari } = body;

  if (!nome || !categoria || preco === undefined || estoque === undefined) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const novo = await gerenciador.cadastrarDoce(
    nome, categoria, Number(preco), Number(estoque), fabricadoEmMari || false
  );
  return NextResponse.json(novo, { status: 201 });
}
