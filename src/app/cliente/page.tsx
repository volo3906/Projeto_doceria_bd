"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Doce, Cliente, Vendedor } from "@/lib/types";
import { formatarPreco, mascaraCpf } from "@/lib/utils";

export default function CatalogoPage() {
  const [doces, setDoces] = useState<Doce[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrecoMin, setFiltroPrecoMin] = useState("");
  const [filtroPrecoMax, setFiltroPrecoMax] = useState("");

  // dialog de compra
  const [dialogAberto, setDialogAberto] = useState(false);
  const [doceParaComprar, setDoceParaComprar] = useState<Doce | null>(null);
  const [quantidade, setQuantidade] = useState("1");
  const [vendedorId, setVendedorId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");

  // identificacao do cliente
  const [cpfBusca, setCpfBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [etapaCompra, setEtapaCompra] = useState<"identificacao" | "pagamento">("identificacao");

  // cadastro rapido
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [cpfNovo, setCpfNovo] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [telefoneNovo, setTelefoneNovo] = useState("");

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

  const categorias = [...new Set(doces.map((d) => d.categoria))].sort();

  function docesFiltrados(): Doce[] {
    let resultado = doces.filter((d) => d.estoque > 0);
    if (busca) resultado = resultado.filter((d) => d.nome.toLowerCase().includes(busca.toLowerCase()));
    if (filtroCategoria) resultado = resultado.filter((d) => d.categoria === filtroCategoria);
    if (filtroPrecoMin) {
      const min = parseFloat(filtroPrecoMin.replace(",", "."));
      if (!isNaN(min)) resultado = resultado.filter((d) => d.preco >= min);
    }
    if (filtroPrecoMax) {
      const max = parseFloat(filtroPrecoMax.replace(",", "."));
      if (!isNaN(max)) resultado = resultado.filter((d) => d.preco <= max);
    }
    return resultado;
  }

  const filtrados = docesFiltrados();

  // abre o dialog de compra pra um doce
  function abrirCompra(doce: Doce) {
    setDoceParaComprar(doce);
    setQuantidade("1");
    setVendedorId("");
    setFormaPagamento("");
    setStatusPagamento("");
    setMostrarCadastro(false);

    // se ja tem cliente identificado, pula pra pagamento
    if (cliente) {
      setEtapaCompra("pagamento");
    } else {
      setEtapaCompra("identificacao");
      setCpfBusca("");
    }
    setDialogAberto(true);
  }

  async function buscarCliente() {
    if (!cpfBusca.trim()) { toast.error("Digite seu CPF"); return; }
    const res = await fetch("/api/clientes");
    if (!res.ok) { toast.error("Erro ao buscar"); return; }
    const clientes = await res.json();
    const digitos = cpfBusca.replace(/\D/g, "");
    const encontrado = clientes.find((c: Cliente) => c.cpf === digitos);
    if (encontrado) {
      setCliente(encontrado);
      setEtapaCompra("pagamento");
      toast.success(`Ola, ${encontrado.nome}!`);
    } else {
      toast.error("CPF nao encontrado");
    }
  }

  async function cadastrarRapido() {
    if (!nomeNovo || !cpfNovo || !emailNovo || !telefoneNovo) {
      toast.error("Preencha todos os campos");
      return;
    }
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeNovo, cpf: cpfNovo, email: emailNovo, telefone: telefoneNovo,
        torceFlamengo: false, assisteOnePiece: false, deSousa: false,
      }),
    });
    const dados = await res.json();
    if (!res.ok) { toast.error(dados.erro || "Erro ao cadastrar"); return; }
    setCliente(dados);
    setEtapaCompra("pagamento");
    toast.success(`Cadastrado! Ola, ${dados.nome}!`);
  }

  async function finalizarCompra() {
    if (!cliente || !doceParaComprar || !vendedorId || !formaPagamento) {
      toast.error("Preencha todos os campos");
      return;
    }
    const qtd = parseInt(quantidade);
    if (qtd <= 0) { toast.error("Quantidade invalida"); return; }

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
        itens: [{ doceId: doceParaComprar.id, quantidade: qtd }],
      }),
    });

    if (!res.ok) {
      try {
        const dados = await res.json();
        toast.error(dados.erro || "Erro ao comprar");
      } catch { toast.error("Erro ao comprar"); }
      return;
    }

    const dados = await res.json();
    if (dados.descontoAplicado && dados.descontoAplicado > 0) {
      toast.success(`Compra realizada com ${dados.descontoAplicado}% de desconto!`);
    } else {
      toast.success("Compra realizada com sucesso!");
    }
    setDialogAberto(false);
    carregarDados();
  }

  // calcula resumo
  const DESCONTO_MAXIMO = 15;
  function calcularResumo() {
    if (!doceParaComprar || !cliente) return null;
    const qtd = parseInt(quantidade) || 0;
    const valorBruto = doceParaComprar.preco * qtd;
    let desconto = 0;
    if (cliente.torceFlamengo) desconto += 5;
    if (cliente.assisteOnePiece) desconto += 5;
    if (cliente.deSousa) desconto += 5;
    desconto = Math.min(desconto, DESCONTO_MAXIMO);
    const valorDesconto = valorBruto * desconto / 100;
    const valorFinal = valorBruto - valorDesconto;
    return { desconto, valorBruto, valorDesconto, valorFinal };
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Catalogo de Doces</h1>
          <p className="text-muted-foreground mt-1">Escolha seus doces e compre diretamente</p>
        </div>

        {/* filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v === "todas" ? "" : (v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Preco minimo</Label>
                <Input placeholder="0,00" value={filtroPrecoMin} onChange={(e) => setFiltroPrecoMin(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Preco maximo</Label>
                <Input placeholder="100,00" value={filtroPrecoMax} onChange={(e) => setFiltroPrecoMax(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* cliente identificado */}
        {cliente && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Comprando como:</span>
                <span className="font-medium">{cliente.nome}</span>
                {(cliente.torceFlamengo || cliente.assisteOnePiece || cliente.deSousa) && (
                  <Badge variant="secondary" className="text-green-600">Desconto ativo</Badge>
                )}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setCliente(null)}>
                  Trocar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* grid de doces */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 col-span-full">Nenhum doce encontrado.</p>
          ) : (
            filtrados.map((doce) => (
              <Card key={doce.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{doce.nome}</CardTitle>
                    {doce.fabricadoEmMari && <Badge variant="outline" className="text-xs">Mari</Badge>}
                  </div>
                  <Badge variant="secondary">{doce.categoria}</Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-500">{formatarPreco(doce.preco)}</span>
                    <span className="text-sm text-muted-foreground">{doce.estoque} em estoque</span>
                  </div>
                  <Button className="w-full" onClick={() => abrirCompra(doce)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* dialog de compra rapida */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {doceParaComprar ? `Comprar ${doceParaComprar.nome}` : "Comprar"}
              </DialogTitle>
            </DialogHeader>

            {/* etapa 1: identificacao */}
            {etapaCompra === "identificacao" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Informe seu CPF para continuar</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu CPF"
                    value={cpfBusca}
                    onChange={(e) => setCpfBusca(mascaraCpf(e.target.value))}
                    maxLength={14}
                    onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                  />
                  <Button onClick={buscarCliente}>Buscar</Button>
                </div>
                {!mostrarCadastro && (
                  <p className="text-sm text-muted-foreground">
                    Nao tem cadastro?{" "}
                    <button className="text-pink-500 underline" onClick={() => { setMostrarCadastro(true); setCpfNovo(cpfBusca); }}>
                      Cadastre-se
                    </button>
                  </p>
                )}
                {mostrarCadastro && (
                  <div className="space-y-3 border-t pt-3">
                    <Input value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} placeholder="Seu nome" />
                    <Input value={cpfNovo} onChange={(e) => setCpfNovo(mascaraCpf(e.target.value))} placeholder="CPF" maxLength={14} />
                    <Input type="email" value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} placeholder="Email" />
                    <Input value={telefoneNovo} onChange={(e) => setTelefoneNovo(e.target.value)} placeholder="Telefone" />
                    <Button onClick={cadastrarRapido} className="w-full">Cadastrar e continuar</Button>
                  </div>
                )}
              </div>
            )}

            {/* etapa 2: pagamento */}
            {etapaCompra === "pagamento" && doceParaComprar && cliente && (
              <div className="space-y-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" max={doceParaComprar.estoque} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                </div>
                <div>
                  <Label>Vendedor</Label>
                  <Select value={vendedorId} onValueChange={(v) => setVendedorId(v ?? "")}>
                    <SelectTrigger>
                      {vendedorId ? vendedores.find((v) => v.id === parseInt(vendedorId))?.nome || "Selecione" : "Selecione o vendedor"}
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((v) => (<SelectItem key={v.id} value={v.id.toString()}>{v.nome}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={(v) => { setFormaPagamento(v ?? ""); setStatusPagamento(""); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* resumo */}
                {(() => {
                  const r = calcularResumo();
                  if (!r) return null;
                  return (
                    <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{doceParaComprar.nome} x{quantidade}</span>
                        <span>{formatarPreco(r.valorBruto)}</span>
                      </div>
                      {r.desconto > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto ({r.desconto}%)</span>
                          <span>- {formatarPreco(r.valorDesconto)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{formatarPreco(r.valorFinal)}</span>
                      </div>
                    </div>
                  );
                })()}

                <Button onClick={finalizarCompra} className="w-full" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Finalizar Compra
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
