import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// DELETE /api/vendedores/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vendedorId = parseInt(id);

  if (isNaN(vendedorId)) {
    return NextResponse.json({ erro: "ID invalido" }, { status: 400 });
  }

  try {
    const resultado = await gerenciador.removerVendedor(vendedorId);
    if (!resultado) {
      return NextResponse.json({ erro: "Vendedor nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ mensagem: "Vendedor removido com sucesso" });
  } catch (erro: any) {
    if (erro.code === "23503") {
      return NextResponse.json(
        { erro: "Nao e possivel remover: este vendedor tem vendas associadas" },
        { status: 400 }
      );
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}

// PATCH /api/vendedores/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vendedorId = parseInt(id);

  if (isNaN(vendedorId)) {
    return NextResponse.json({ erro: "ID invalido" }, { status: 400 });
  }

  const body = await request.json();
  const { nome, email, telefone, cpf } = body;

  if (!nome && !email && !telefone && !cpf) {
    return NextResponse.json({ erro: "Nenhum campo para atualizar" }, { status: 400 });
  }

  try {
    const atualizado = await gerenciador.atualizarVendedor(vendedorId, {
      nome, email, telefone, cpf,
    });

    if (!atualizado) {
      return NextResponse.json({ erro: "Vendedor nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(atualizado);
  } catch (erro: any) {
    if (erro.code === "23505") {
      return NextResponse.json({ erro: "CPF ja cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
