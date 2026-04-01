"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ShoppingCart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Cliente, Venda } from "@/lib/types";
import { formatarCpf, formatarTelefone, formatarPreco } from "@/lib/utils";
import Link from "next/link";

export default function ClienteDetalhePage() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const [resCliente, resVendas] = await Promise.all([
        fetch(`/api/clientes/${id}`),
        fetch("/api/vendas"),
      ]);

      if (!resCliente.ok) {
        toast.error("Cliente nao encontrado");
        setCarregando(false);
        return;
      }

      const clienteData = await resCliente.json();
      const vendasData = await resVendas.json();

      setCliente(clienteData);
      // filtra so as vendas desse cliente
      setVendas(vendasData.filter((v: Venda) => v.clienteId === parseInt(id)));
      setCarregando(false);
    } catch {
      toast.error("Erro ao conectar com o servidor");
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <AppLayout>
        <p>Carregando...</p>
      </AppLayout>
    );
  }

  if (!cliente) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <p>Cliente nao encontrado.</p>
          <Link href="/admin/clientes">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // calcula totais
  let totalGasto = 0;
  for (const v of vendas) {
    totalGasto += v.valorTotal;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* cabecalho */}
        <div className="flex items-center gap-4">
          <Link href="/admin/clientes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nome}</h1>
            <p className="text-muted-foreground">Detalhes do cliente</p>
          </div>
          {(cliente.torceFlamengo || cliente.assisteOnePiece || cliente.deSousa) && (
            <Badge variant="secondary">Desconto</Badge>
          )}
        </div>

        {/* dados cadastrais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">CPF</span>
                  <span className="font-mono">{formatarCpf(cliente.cpf)}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Email</span>
                  <span>{cliente.email}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Telefone</span>
                  <span>{formatarTelefone(cliente.telefone)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Flamengo</span>
                  <span>{cliente.torceFlamengo ? "Sim" : "Nao"}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">One Piece</span>
                  <span>{cliente.assisteOnePiece ? "Sim" : "Nao"}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">De Sousa</span>
                  <span>{cliente.deSousa ? "Sim" : "Nao"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* resumo de compras */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
              <ShoppingCart className="h-5 w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarPreco(totalGasto)}</div>
            </CardContent>
          </Card>
        </div>

        {/* historico de compras */}
        <Card>
          <CardHeader>
            <CardTitle>Historico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Este cliente ainda nao realizou nenhuma compra.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {venda.id}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatarPreco(venda.valorTotal)}
                      </TableCell>
                      <TableCell>{venda.formaPagamento || "—"}</TableCell>
                      <TableCell>{venda.statusPagamento || "—"}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {venda.dataVenda}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}