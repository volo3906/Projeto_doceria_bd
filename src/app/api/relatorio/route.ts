import { NextResponse } from "next/server";
import gerenciador from "@/lib/dados";

// GET /api/relatorio
export async function GET() {
  return NextResponse.json(await gerenciador.gerarRelatorio());
}