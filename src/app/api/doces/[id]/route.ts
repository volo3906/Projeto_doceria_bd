import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/doces/1
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doce = await gerenciador.buscarDocePorId(Number(id));
  if (!doce) {
    return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(doce);
}

// PUT /api/doces/1
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const atualizado = await gerenciador.atualizarDoce(Number(id), body);
  if (!atualizado) {
    return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(atualizado);
}

// DELETE /api/doces/1
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const removido = await gerenciador.removerDoce(Number(id));
    if (!removido) {
      return NextResponse.json({ erro: "Doce nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Removido com sucesso" });
  } catch (erro: any) {
    if (erro.code === "23503") {
      return NextResponse.json(
        { erro: "Nao e possivel remover: este doce tem vendas associadas" },
        { status: 400 }
      );
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
