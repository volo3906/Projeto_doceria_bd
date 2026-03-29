import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/vendas
export async function GET() {
  return NextResponse.json(await gerenciador.listarVendas());
}

// POST /api/vendas
export async function POST(request: Request) {
  const body = await request.json();
  const { clienteId, doceId, vendedorId, quantidade, formaPagamento, statusPagamento } = body;

  if (!clienteId || !doceId || !vendedorId || !quantidade || !formaPagamento) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const resultado = await gerenciador.registrarVenda(
    Number(clienteId),
    Number(doceId),
    Number(vendedorId),
    Number(quantidade),
    formaPagamento,
    statusPagamento
  );

  // se retornou string, eh uma mensagem de erro
  if (typeof resultado === "string") {
    return NextResponse.json({ erro: resultado }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: 201 });
}