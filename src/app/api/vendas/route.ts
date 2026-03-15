import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/vendas
export async function GET() {
  return NextResponse.json(gerenciador.listarVendas());
}

// POST /api/vendas
export async function POST(request: Request) {
  const body = await request.json();
  const { clienteId, doceId, quantidade } = body;

  if (!clienteId || !doceId || !quantidade) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const resultado = gerenciador.registrarVenda(Number(clienteId), Number(doceId), Number(quantidade));

  // se retornou string, eh uma mensagem de erro
  if (typeof resultado === "string") {
    return NextResponse.json({ erro: resultado }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: 201 });
}
