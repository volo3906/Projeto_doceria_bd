"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ShoppingCart, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Doce, Cliente, Vendedor } from "@/lib/types";
import { formatarPreco, mascaraCpf } from "@/lib/utils";

interface ItemCarrinho {
  doceId: number;
  quantidade: number;
}

export default function ComprarPage() {
  const [doces, setDoces] = useState<Doce[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // identificacao do cliente
  const [etapa, setEtapa] = useState<"identificacao" | "carrinho">("identificacao");
  const [cpfBusca, setCpfBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  // campos do cadastro
  const [nome, setNome] = useState("");
  const [cpfNovo, setCpfNovo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // carrinho
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [doceIdParaAdicionar, setDoceIdParaAdicionar] = useState("");
  const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resDoces, resVendedores] = await Promise.all([
        fetch("/api/doces"),
        fetch("/api/vendedores"),
      ]);
      if (resDoces.ok) setDoces(await resDoces.json());
      if (resVendedores.ok) setVendedores(await resVendedores.json());
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }

  // busca cliente por CPF
  async function buscarCliente() {
    if (!cpfBusca.trim()) {
      toast.error("Digite seu CPF");
      return;
    }

    const res = await fetch("/api/clientes");
    if (!res.ok) {
      toast.error("Erro ao buscar");
      return;
    }

    const clientes = await res.json();
    const digitos = cpfBusca.replace(/\D/g, "");
    const encontrado = clientes.find((c: Cliente) => c.cpf === digitos);

    if (encontrado) {
      setCliente(encontrado);
      setEtapa("carrinho");
      setMostrarCadastro(false);
      toast.success(`Bem-vindo, ${encontrado.nome}!`);
    } else {
      setCliente(null);
      setMostrarCadastro(false);
      toast.error("CPF nao encontrado");
    }
  }

  // cadastra cliente novo e vai pro carrinho
  async function cadastrarEContinuar() {
    if (!nome || !cpfNovo || !email || !telefone) {
      toast.error("Preencha todos os campos");
      return;
    }

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome, cpf: cpfNovo, email, telefone,
        torceFlamengo: false, assisteOnePiece: false, deSousa: false,
      }),
    });

    const dados = await res.json();
    if (!res.ok) {
      toast.error(dados.erro || "Erro ao cadastrar");
      return;
    }

    setCliente(dados);
    setEtapa("carrinho");
    toast.success(`Cadastrado! Bem-vindo, ${dados.nome}!`);
  }

  function adicionarAoCarrinho() {
    if (!doceIdParaAdicionar || !quantidadeParaAdicionar) {
      toast.error("Selecione o doce e a quantidade");
      return;
    }
    const qtd = parseInt(quantidadeParaAdicionar);
    if (qtd <= 0) return;

    const doceId = parseInt(doceIdParaAdicionar);
    const existente = itensCarrinho.find((item) => item.doceId === doceId);
    if (existente) {
      setItensCarrinho(itensCarrinho.map((item) =>
        item.doceId === doceId ? { ...item, quantidade: item.quantidade + qtd } : item
      ));
    } else {
      setItensCarrinho([...itensCarrinho, { doceId, quantidade: qtd }]);
    }
    setDoceIdParaAdicionar("");
    setQuantidadeParaAdicionar("");
  }

  function removerDoCarrinho(doceId: number) {
    setItensCarrinho(itensCarrinho.filter((item) => item.doceId !== doceId));
  }

  async function finalizarCompra() {
    if (!cliente || itensCarrinho.length === 0 || !vendedorId || !formaPagamento) {
      toast.error("Preencha todos os campos e adicione pelo menos um doce");
      return;
    }

    let finalStatus = statusPagamento;
    if (["cartao", "boleto", "pix", "berries"].includes(formaPagamento) && !finalStatus) {
      toast.error("Selecione o status do pagamento");
      return;
    }

    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: cliente.id,
        vendedorId: parseInt(vendedorId),
        formaPagamento,
        statusPagamento: finalStatus || undefined,
        itens: itensCarrinho,
      }),
    });

    if (!res.ok) {
      try {
        const dados = await res.json();
        toast.error(dados.erro || "Erro ao finalizar compra");
      } catch {
        toast.error("Erro ao finalizar compra");
      }
      return;
    }

    const dados = await res.json();
    if (dados.descontoAplicado && dados.descontoAplicado > 0) {
      toast.success(`Compra realizada com ${dados.descontoAplicado}% de desconto!`);
    } else {
      toast.success("Compra realizada com sucesso!");
    }

    // limpa tudo e volta pra identificacao
    setItensCarrinho([]);
    setVendedorId("");
    setFormaPagamento("");
    setStatusPagamento("");
    setDoceIdParaAdicionar("");
    setQuantidadeParaAdicionar("");
    setCliente(null);
    setEtapa("identificacao");
    setCpfBusca("");
    carregarDados();
  }

  // calcula resumo com desconto
  const DESCONTO_MAXIMO = 15;
  function calcularResumo() {
    if (itensCarrinho.length === 0 || !cliente) return null;
    let valorBruto = 0;
    for (const item of itensCarrinho) {
      const doce = doces.find((d) => d.id === item.doceId);
      if (doce) valorBruto += doce.preco * item.quantidade;
    }
    let desconto = 0;
    if (cliente.torceFlamengo) desconto += 5;
    if (cliente.assisteOnePiece) desconto += 5;
    if (cliente.deSousa) desconto += 5;
    desconto = Math.min(desconto, DESCONTO_MAXIMO);
    const valorDesconto = valorBruto * desconto / 100;
    const valorFinal = valorBruto - valorDesconto;
    return { desconto, valorBruto, valorDesconto, valorFinal };
  }

  const resumo = calcularResumo();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fazer uma Compra</h1>
          <p className="text-muted-foreground mt-1">
            {etapa === "identificacao"
              ? "Primeiro, identifique-se para continuar"
              : `Comprando como ${cliente?.nome}`}
          </p>
        </div>

        {/* ETAPA 1: identificacao */}
        {etapa === "identificacao" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Ja e cliente?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="Digite seu CPF"
                    value={cpfBusca}
                    onChange={(e) => setCpfBusca(mascaraCpf(e.target.value))}
                    maxLength={14}
                    onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                  />
                  <Button onClick={buscarCliente}>
                    Buscar
                  </Button>
                </div>
                {!mostrarCadastro && (
                  <p className="text-sm text-muted-foreground">
                    Nao tem cadastro?{" "}
                    <button
                      className="text-pink-500 underline"
                      onClick={() => {
                        setMostrarCadastro(true);
                        setCpfNovo(cpfBusca);
                      }}
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                )}
              </CardContent>
            </Card>

            {mostrarCadastro && (
              <Card>
                <CardHeader>
                  <CardTitle>Novo Cadastro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                  <div>
                    <Label>Nome</Label>
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input value={cpfNovo} onChange={(e) => setCpfNovo(mascaraCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(83) 99999-0001" />
                  </div>
                  <Button onClick={cadastrarEContinuar} className="w-full">
                    Cadastrar e continuar comprando
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ETAPA 2: carrinho */}
        {etapa === "carrinho" && cliente && (
          <>
            {/* identificacao confirmada */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{cliente.nome}</span>
                  {(cliente.torceFlamengo || cliente.assisteOnePiece || cliente.deSousa) && (
                    <Badge variant="secondary" className="text-green-600">
                      Desconto ativo
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                    setEtapa("identificacao");
                    setCliente(null);
                    setItensCarrinho([]);
                  }}>
                    Trocar cliente
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* adicionar doces */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar doces ao carrinho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={doceIdParaAdicionar} onValueChange={(v) => setDoceIdParaAdicionar(v ?? "")}>
                    <SelectTrigger className="flex-1">
                      {doceIdParaAdicionar
                        ? doces.find((d) => d.id === parseInt(doceIdParaAdicionar))?.nome || "Selecione o doce"
                        : "Selecione o doce"}
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                      {doces.filter((d) => d.estoque > 0).map((d) => (
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
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    className="w-20"
                    value={quantidadeParaAdicionar}
                    onChange={(e) => setQuantidadeParaAdicionar(e.target.value)}
                  />
                  <Button variant="secondary" onClick={adicionarAoCarrinho}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* itens no carrinho */}
                {itensCarrinho.length > 0 && (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doce</TableHead>
                          <TableHead className="text-center w-16">Qtd</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensCarrinho.map((item) => {
                          const doce = doces.find((d) => d.id === item.doceId);
                          const subtotal = doce ? doce.preco * item.quantidade : 0;
                          return (
                            <TableRow key={item.doceId}>
                              <TableCell className="font-medium">{doce?.nome || "?"}</TableCell>
                              <TableCell className="text-center">{item.quantidade}</TableCell>
                              <TableCell className="text-right">{formatarPreco(subtotal)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removerDoCarrinho(item.doceId)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* pagamento */}
            {itensCarrinho.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Vendedor que esta atendendo</Label>
                    <Select value={vendedorId} onValueChange={(v) => setVendedorId(v ?? "")}>
                      <SelectTrigger>
                        {vendedorId
                          ? vendedores.find((v) => v.id === parseInt(vendedorId))?.nome || "Selecione o vendedor"
                          : "Selecione o vendedor"}
                      </SelectTrigger>
                      <SelectContent>
                        {vendedores.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Forma de Pagamento</Label>
                    <Select value={formaPagamento} onValueChange={(v) => {
                      setFormaPagamento(v ?? "");
                      setStatusPagamento("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartao">Cartao</SelectItem>
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
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* resumo com desconto */}
                  {resumo && (
                    <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                      <p className="text-sm font-medium">Resumo da compra ({itensCarrinho.length} {itensCarrinho.length === 1 ? "item" : "itens"})</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
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
                          Desconto por:
                          {cliente.torceFlamengo ? " Flamengo" : ""}
                          {cliente.assisteOnePiece ? " One Piece" : ""}
                          {cliente.deSousa ? " Sousa" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  <Button onClick={finalizarCompra} className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Finalizar Compra
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
