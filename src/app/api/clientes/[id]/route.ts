import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/clientes/1
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await gerenciador.buscarClientePorId(Number(id));
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(cliente);
}

// PUT /api/clientes/1
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const atualizado = await gerenciador.atualizarCliente(Number(id), body);
  if (!atualizado) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(atualizado);
}

// DELETE /api/clientes/1
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const removido = await gerenciador.removerCliente(Number(id));
    if (!removido) {
      return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Removido com sucesso" });
  } catch (erro: any) {
    if (erro.code === "23503") {
      return NextResponse.json(
        { erro: "Nao e possivel remover: este cliente tem vendas associadas" },
        { status: 400 }
      );
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
