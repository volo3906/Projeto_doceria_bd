"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import { Doce, Cliente, Venda } from "@/lib/types";
import { formatarPreco, formatarTelefone } from "@/lib/utils";

export default function RelatoriosPage() {
  const [doces, setDoces] = useState<Doce[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resDoces, resClientes, resVendas] = await Promise.all([
      fetch("/api/doces"),
      fetch("/api/clientes"),
      fetch("/api/vendas"),
    ]);
    setDoces(await resDoces.json());
    setClientes(await resClientes.json());
    setVendas(await resVendas.json());
    setCarregando(false);
  }

  if (carregando) {
    return (
      <AppLayout>
        <p>Carregando...</p>
      </AppLayout>
    );
  }

  // calculos para o relatorio de estoque
  let valorTotalEstoque = 0;
  let docesEstoqueBaixo = 0;
  for (const d of doces) {
    valorTotalEstoque += d.preco * d.estoque;
    if (d.estoque < 5) docesEstoqueBaixo++;
  }

  // calculos para o relatorio de vendas
  let totalArrecadado = 0;
  for (const v of vendas) {
    totalArrecadado += v.valorTotal;
  }
  const ticketMedio = vendas.length > 0 ? totalArrecadado / vendas.length : 0;

  // calcular compras por cliente
  function comprasDoCliente(clienteId: number) {
    let total = 0;
    let quantidade = 0;
    for (const v of vendas) {
      if (v.clienteId === clienteId) {
        total += v.valorTotal;
        quantidade++;
      }
    }
    return { total, quantidade };
  }

  // pegar nome do doce/cliente para a tabela de vendas
  function nomeDoce(id: number) {
    for (const d of doces) {
      if (d.id === id) return d.nome;
    }
    return "Doce removido";
  }

  function nomeCliente(id: number) {
    for (const c of clientes) {
      if (c.id === id) return c.nome;
    }
    return "Cliente removido";
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Relatorios</h1>
          <p className="text-muted-foreground mt-1">
            Relatorios separados de estoque, clientes e vendas
          </p>
        </div>

        {/* ==================== RELATORIO DE ESTOQUE ==================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-pink-500" />
              Relatorio de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* resumo do estoque */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold">{doces.length}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">{formatarPreco(valorTotalEstoque)}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">
                  {docesEstoqueBaixo > 0 ? (
                    <span className="flex items-center justify-center gap-1 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {docesEstoqueBaixo}
                    </span>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </p>
              </div>
            </div>

            {doces.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum doce cadastrado.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doce</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preco Unit.</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-right">Valor Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doces.map((doce) => (
                    <TableRow key={doce.id}>
                      <TableCell className="font-medium">{doce.nome}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doce.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatarPreco(doce.preco)}
                      </TableCell>
                      <TableCell className="text-center">
                        {doce.estoque < 5 ? (
                          <Badge variant="destructive">{doce.estoque}</Badge>
                        ) : (
                          <span>{doce.estoque}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatarPreco(doce.preco * doce.estoque)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* ==================== RELATORIO DE CLIENTES ==================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Relatorio de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* resumo dos clientes */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Clientes com Compras</p>
                <p className="text-2xl font-bold">
                  {clientes.filter((c) => comprasDoCliente(c.id).quantidade > 0).length}
                </p>
              </div>
            </div>

            {clientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum cliente cadastrado.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-center">Compras</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => {
                    const stats = comprasDoCliente(cliente.id);
                    return (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{formatarTelefone(cliente.telefone)}</TableCell>
                        <TableCell className="text-center">
                          {stats.quantidade > 0 ? (
                            <Badge variant="secondary">{stats.quantidade}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {stats.total > 0
                            ? formatarPreco(stats.total)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* ==================== RELATORIO DE VENDAS ==================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              Relatorio de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* resumo das vendas */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
                <p className="text-2xl font-bold">{vendas.length}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Total Arrecadado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarPreco(totalArrecadado)}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Ticket Medio</p>
                <p className="text-2xl font-bold">{formatarPreco(ticketMedio)}</p>
              </div>
            </div>

            {vendas.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma venda registrada.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Doce</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {venda.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {nomeCliente(venda.clienteId)}
                      </TableCell>
                      <TableCell>{nomeDoce(venda.doceId)}</TableCell>
                      <TableCell className="text-center">{venda.quantidade}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatarPreco(venda.valorTotal)}
                      </TableCell>
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
