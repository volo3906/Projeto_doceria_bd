"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Doce, Cliente, Venda } from "@/lib/types";

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [doces, setDoces] = useState<Doce[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);

  // campos do formulario de venda
  const [clienteId, setClienteId] = useState("");
  const [doceId, setDoceId] = useState("");
  const [quantidade, setQuantidade] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    // carrega tudo de uma vez
    const [resVendas, resDoces, resClientes] = await Promise.all([
      fetch("/api/vendas"),
      fetch("/api/doces"),
      fetch("/api/clientes"),
    ]);

    setVendas(await resVendas.json());
    setDoces(await resDoces.json());
    setClientes(await resClientes.json());
  }

  async function realizarVenda() {
    if (!clienteId || !doceId || !quantidade) {
      toast.error("Preencha todos os campos");
      return;
    }

    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: parseInt(clienteId),
        doceId: parseInt(doceId),
        quantidade: parseInt(quantidade),
      }),
    });

    const dados = await res.json();

    if (!res.ok) {
      toast.error(dados.erro);
      return;
    }

    toast.success("Venda realizada!");
    setDialogAberto(false);
    setClienteId("");
    setDoceId("");
    setQuantidade("");
    carregarDados();
  }

  // funcoes auxiliares pra pegar nome pelo id
  function nomeCliente(id: number): string {
    const c = clientes.find((c) => c.id === id);
    return c ? c.nome : `Cliente #${id}`;
  }

  function nomeDoce(id: number): string {
    const d = doces.find((d) => d.id === id);
    return d ? d.nome : `Doce #${id}`;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground mt-1">Registre e visualize as vendas</p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Venda</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={clienteId} onValueChange={(v) => setClienteId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clientes.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastre um cliente primeiro
                    </p>
                  )}
                </div>
                <div>
                  <Label>Doce</Label>
                  <Select value={doceId} onValueChange={(v) => setDoceId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o doce" />
                    </SelectTrigger>
                    <SelectContent>
                      {doces.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.nome} — R$ {d.preco.toFixed(2)} (estoque: {d.estoque})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {doces.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastre um doce primeiro
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <Button onClick={realizarVenda} className="w-full">
                  Confirmar Venda
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* tabela de vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Historico de Vendas ({vendas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Doce</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {venda.id}
                      </TableCell>
                      <TableCell>{nomeCliente(venda.clienteId)}</TableCell>
                      <TableCell>{nomeDoce(venda.doceId)}</TableCell>
                      <TableCell className="text-center">{venda.quantidade}</TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {venda.valorTotal.toFixed(2)}
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
