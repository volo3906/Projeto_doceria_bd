import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/vendas
export async function GET() {
  return NextResponse.json(await gerenciador.listarVendas());
}

// POST /api/vendas
export async function POST(request: Request) {
  const body = await request.json();
  const { clienteId, vendedorId, formaPagamento, statusPagamento, itens } = body;

  if (!clienteId || !vendedorId || !formaPagamento || !itens || itens.length === 0) {
    return NextResponse.json({ erro: "Campos obrigatorios faltando" }, { status: 400 });
  }

  // valida que cada item tem doceId e quantidade
  for (const item of itens) {
    if (!item.doceId || !item.quantidade || item.quantidade <= 0) {
      return NextResponse.json({ erro: "Cada item precisa de doce e quantidade" }, { status: 400 });
    }
  }

  const resultado = await gerenciador.registrarVenda(
    Number(clienteId),
    Number(vendedorId),
    formaPagamento,
    statusPagamento,
    itens.map((item: any) => ({ doceId: Number(item.doceId), quantidade: Number(item.quantidade) }))
  );

  // se retornou string, eh uma mensagem de erro
  if (typeof resultado === "string") {
    return NextResponse.json({ erro: resultado }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: 201 });
}