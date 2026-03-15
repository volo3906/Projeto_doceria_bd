import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/clientes/1
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = gerenciador.buscarClientePorId(Number(id));
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(cliente.toObject());
}

// PUT /api/clientes/1
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const atualizado = gerenciador.atualizarCliente(Number(id), body);
  if (!atualizado) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json(atualizado);
}

// DELETE /api/clientes/1
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removido = gerenciador.removerCliente(Number(id));
  if (!removido) {
    return NextResponse.json({ erro: "Cliente nao encontrado" }, { status: 404 });
  }
  return NextResponse.json({ mensagem: "Removido com sucesso" });
}
