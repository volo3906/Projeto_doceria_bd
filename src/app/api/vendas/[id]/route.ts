import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/vendas/[id] — retorna a venda com seus itens
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venda = await gerenciador.buscarVendaPorId(Number(id));
  if (!venda) {
    return NextResponse.json({ erro: "Venda nao encontrada" }, { status: 404 });
  }

  const itens = await gerenciador.buscarItensVenda(Number(id));
  return NextResponse.json({ ...venda, itens });
}