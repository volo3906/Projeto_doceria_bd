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
import { Doce, Cliente, Venda, Vendedor } from "@/lib/types";
import { formatarPreco } from "@/lib/utils";

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [doces, setDoces] = useState<Doce[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);

  // campos do formulario de venda
  const [clienteId, setClienteId] = useState("");
  const [doceId, setDoceId] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      // carrega tudo de uma vez
      const [resVendas, resDoces, resClientes, resVendedores] = await Promise.all([
        fetch("/api/vendas"),
        fetch("/api/doces"),
        fetch("/api/clientes"),
        fetch("/api/vendedores"),
      ]);

      if (!resVendas.ok || !resDoces.ok || !resClientes.ok || !resVendedores.ok) {
        toast.error("Erro ao carregar dados");
        return;
      }

      setVendas(await resVendas.json());
      setDoces(await resDoces.json());
      setClientes(await resClientes.json());
      setVendedores(await resVendedores.json());
    } catch {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  async function realizarVenda() {
    if (!clienteId || !doceId || !vendedorId || !quantidade || !formaPagamento) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    // apenas validar status se for um dos pagamentos que requer
    let finalStatus = statusPagamento;
    if (["cartao", "boleto", "pix", "berries"].includes(formaPagamento)) {
      if (!finalStatus) {
        toast.error("Selecione um status de pagamento");
        return;
      }
    }

    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: parseInt(clienteId),
        doceId: parseInt(doceId),
        vendedorId: parseInt(vendedorId),
        quantidade: parseInt(quantidade),
        formaPagamento,
        statusPagamento: finalStatus || undefined,
      }),
    });

    if (!res.ok) {
      try {
        const dados = await res.json();
        toast.error(dados.erro || "Erro ao realizar venda");
      } catch {
        toast.error(`Erro ao realizar venda (${res.status})`);
      }
      return;
    }

    const dados = await res.json();
    if (dados.descontoAplicado && dados.descontoAplicado > 0) {
      toast.success(`Venda realizada com ${dados.descontoAplicado}% de desconto!`);
    } else {
      toast.success("Venda realizada!");
    }
    setDialogAberto(false);
    setClienteId("");
    setDoceId("");
    setVendedorId("");
    setQuantidade("");
    setFormaPagamento("");
    setStatusPagamento("");
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

  function nomeVendedor(id: number | null): string {
    if (!id) return "—";
    const v = vendedores.find((v) => v.id === id);
    return v ? v.nome : `Vendedor #${id}`;
  }

  function getNomeFormaPagamento(forma: string | null): string {
    if (!forma) return "—";
    const formas: Record<string, string> = {
      cartao: "Cartão",
      boleto: "Boleto",
      pix: "PIX",
      berries: "Berries",
      dinheiro: "Dinheiro",
    };
    return formas[forma] || forma;
  }

  function getBadgeStatus(status?: string): string {
    const statuses: Record<string, string> = {
      confirmado: "🟢 Confirmado",
      pendente: "🟡 Pendente",
      recusado: "🔴 Recusado",
    };
    return statuses[status || ""] || "—";
  }

  // calcula desconto e resumo da venda em tempo real
  function calcularResumoVenda() {
    if (!clienteId || !doceId || !quantidade) return null;

    const cliente = clientes.find((c) => c.id === parseInt(clienteId));
    const doce = doces.find((d) => d.id === parseInt(doceId));
    const qtd = parseInt(quantidade);

    if (!cliente || !doce || qtd <= 0) return null;

    // calcula desconto: 5% por flag
    let desconto = 0;
    if (cliente.torceFlamengo) desconto += 5;
    if (cliente.assisteOnePiece) desconto += 5;
    if (cliente.deSousa) desconto += 5;

    const valorBruto = doce.preco * qtd;
    const valorDesconto = valorBruto * desconto / 100;
    const valorFinal = valorBruto - valorDesconto;

    return { cliente, doce, qtd, desconto, valorBruto, valorDesconto, valorFinal };
  }

  const resumo = calcularResumoVenda();

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
            <DialogContent className="max-w-md">
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
                  <Label>Vendedor</Label>
                  <Select value={vendedorId} onValueChange={(v) => setVendedorId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vendedores.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastre um vendedor primeiro
                    </p>
                  )}
                </div>
                <div>
                  <Label>Doce</Label>
                  <Select value={doceId} onValueChange={(v) => setDoceId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o doce" />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                      {doces.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          <div className="flex flex-col">
                            <span>{d.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatarPreco(d.preco)} — estoque: {d.estoque}
                            </span>
                          </div>
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
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={(v) => {
                    setFormaPagamento(v ?? "");
                    setStatusPagamento("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="berries">Berries</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["cartao", "boleto", "pix", "berries"].includes(formaPagamento) && (
                  <div>
                    <Label>Status do Pagamento</Label>
                    <Select value={statusPagamento} onValueChange={(v) => setStatusPagamento(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* resumo da venda em tempo real */}
                {resumo && (
                  <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                    <p className="text-sm font-medium">Resumo da venda</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {resumo.doce.nome} x{resumo.qtd}
                      </span>
                      <span>{formatarPreco(resumo.valorBruto)}</span>
                    </div>
                    {resumo.desconto > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto ({resumo.desconto}%)</span>
                        <span>- {formatarPreco(resumo.valorDesconto)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span>{formatarPreco(resumo.valorFinal)}</span>
                    </div>
                    {resumo.desconto > 0 && (
                      <p className="text-xs text-green-600">
                        {resumo.cliente.nome} tem desconto por:
                        {resumo.cliente.torceFlamengo ? " Flamengo" : ""}
                        {resumo.cliente.assisteOnePiece ? " One Piece" : ""}
                        {resumo.cliente.deSousa ? " Sousa" : ""}
                      </p>
                    )}
                  </div>
                )}

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Doce</TableHead>
                      <TableHead className="w-12">Qtd</TableHead>
                      <TableHead className="text-right">Total</TableHead>
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
                        <TableCell>{nomeCliente(venda.clienteId)}</TableCell>
                        <TableCell>{nomeVendedor(venda.vendedorId)}</TableCell>
                        <TableCell>{nomeDoce(venda.doceId)}</TableCell>
                        <TableCell className="text-center">{venda.quantidade}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatarPreco(venda.valorTotal)}
                        </TableCell>
                        <TableCell>{getNomeFormaPagamento(venda.formaPagamento)}</TableCell>
                        <TableCell>{getBadgeStatus(venda.statusPagamento)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {venda.dataVenda}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
