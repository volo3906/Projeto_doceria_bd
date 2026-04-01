"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ShoppingCart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Cliente, Venda } from "@/lib/types";
import { formatarPreco, mascaraCpf } from "@/lib/utils";

export default function MinhasComprasPage() {
  const [cpfBusca, setCpfBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [buscou, setBuscou] = useState(false);

  async function buscarCompras() {
    if (!cpfBusca.trim()) {
      toast.error("Digite seu CPF");
      return;
    }

    // busca cliente pelo CPF
    const resClientes = await fetch("/api/clientes");
    if (!resClientes.ok) {
      toast.error("Erro ao buscar dados");
      return;
    }

    const clientes = await resClientes.json();
    const digitos = cpfBusca.replace(/\D/g, "");
    const encontrado = clientes.find((c: Cliente) => c.cpf === digitos);

    if (!encontrado) {
      setCliente(null);
      setVendas([]);
      setBuscou(true);
      return;
    }

    // busca vendas desse cliente
    const resVendas = await fetch("/api/vendas");
    if (!resVendas.ok) {
      toast.error("Erro ao buscar vendas");
      return;
    }

    const todasVendas = await resVendas.json();
    const vendasCliente = todasVendas.filter((v: Venda) => v.clienteId === encontrado.id);

    setCliente(encontrado);
    setVendas(vendasCliente);
    setBuscou(true);
  }

  // calcula totais
  let totalGasto = 0;
  for (const v of vendas) {
    totalGasto += v.valorTotal;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Compras</h1>
          <p className="text-muted-foreground mt-1">
            Informe seu CPF para ver seu historico de compras
          </p>
        </div>

        {/* busca por CPF */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Digite seu CPF"
                value={cpfBusca}
                onChange={(e) => setCpfBusca(mascaraCpf(e.target.value))}
                maxLength={14}
                onKeyDown={(e) => e.key === "Enter" && buscarCompras()}
              />
              <Button onClick={buscarCompras}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {buscou && !cliente && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">CPF nao encontrado.</p>
            </CardContent>
          </Card>
        )}

        {cliente && (
          <>
            {/* resumo */}
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

            {/* tabela de compras */}
            <Card>
              <CardHeader>
                <CardTitle>Historico de {cliente.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                {vendas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Voce ainda nao realizou nenhuma compra.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
