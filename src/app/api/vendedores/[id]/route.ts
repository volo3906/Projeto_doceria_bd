import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// DELETE /api/vendedores/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // `params` may be a Promise in Next.js App Router runtime — await it first
  const resolvedParams: any = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const resultado = await gerenciador.removerVendedor(id);

  if (!resultado) {
    return NextResponse.json({ erro: "Vendedor não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ mensagem: "Vendedor removido com sucesso" });
}

// PATCH /api/vendedores/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams: any = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const body = await request.json();
  const { nome, email, telefone, cpf } = body;

  if (!nome && !email && !telefone && !cpf) {
    return NextResponse.json({ erro: "Nenhum campo para atualizar" }, { status: 400 });
  }

  // valida email se fornecido
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ erro: "Email invalido" }, { status: 400 });
    }
  }

  // normaliza cpf se fornecido
  let cpfFormatado = undefined;
  if (cpf) {
    const digits = String(cpf).replace(/\D/g, "");
    if (digits.length !== 11) {
      return NextResponse.json({ erro: "CPF invalido: informe 11 digitos" }, { status: 400 });
    }
    cpfFormatado = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
  }

  try {
    const atualizado = await gerenciador.atualizarVendedor(id, {
      nome,
      email,
      telefone,
      cpf: cpfFormatado,
    } as any);

    if (!atualizado) {
      return NextResponse.json({ erro: "Vendedor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(atualizado);
  } catch (erro: any) {
    console.error('Erro ao atualizar vendedor:', erro);
    if (erro && (erro.code === '23505' || erro.detail?.includes('cpf'))) {
      return NextResponse.json({ erro: 'CPF ja cadastrado' }, { status: 400 });
    }
    const devMsg = process.env.NODE_ENV === 'production' ? 'Erro interno' : (erro?.message || String(erro));
    return NextResponse.json({ erro: devMsg }, { status: 500 });
  }
}
