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
import { Plus, Search, Pencil, Trash2, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { Doce } from "@/lib/types";
import { formatarPreco, parsearPreco } from "@/lib/utils";

export default function DocesPage() {
  const [doces, setDoces] = useState<Doce[]>([]);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Doce | null>(null);
  const [visualizando, setVisualizando] = useState<Doce | null>(null);

  // filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrecoMin, setFiltroPrecoMin] = useState("");
  const [filtroPrecoMax, setFiltroPrecoMax] = useState("");
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // campos do formulario
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [fabricadoEmMari, setFabricadoEmMari] = useState(false);

  useEffect(() => {
    carregarDoces();
  }, []);

  async function carregarDoces() {
    try {
      const res = await fetch("/api/doces");
      if (!res.ok) {
        toast.error("Erro ao carregar doces");
        return;
      }
      const dados = await res.json();
      setDoces(dados);
    } catch {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  async function pesquisar() {
    if (!busca.trim()) {
      carregarDoces();
      return;
    }
    try {
      const res = await fetch(`/api/doces?nome=${busca}`);
      if (!res.ok) {
        toast.error("Erro ao pesquisar");
        return;
      }
      const dados = await res.json();
      setDoces(dados);
    } catch {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  // categorias unicas pra popular o dropdown de filtro
  const categorias = [...new Set(doces.map((d) => d.categoria))].sort();

  // filtra os doces com base nos filtros ativos
  function docesFiltrados(): Doce[] {
    let resultado = doces;

    if (filtroCategoria) {
      resultado = resultado.filter((d) => d.categoria === filtroCategoria);
    }
    if (filtroPrecoMin) {
      const min = parseFloat(filtroPrecoMin.replace(",", "."));
      if (!isNaN(min)) resultado = resultado.filter((d) => d.preco >= min);
    }
    if (filtroPrecoMax) {
      const max = parseFloat(filtroPrecoMax.replace(",", "."));
      if (!isNaN(max)) resultado = resultado.filter((d) => d.preco <= max);
    }
    if (filtroEstoqueBaixo) {
      resultado = resultado.filter((d) => d.estoque < 5);
    }

    return resultado;
  }

  const filtrados = docesFiltrados();
  const temFiltroAtivo = filtroCategoria || filtroPrecoMin || filtroPrecoMax || filtroEstoqueBaixo;

  function limparFiltros() {
    setFiltroCategoria("");
    setFiltroPrecoMin("");
    setFiltroPrecoMax("");
    setFiltroEstoqueBaixo(false);
  }

  function abrirParaEditar(doce: Doce) {
    setEditando(doce);
    setNome(doce.nome);
    setCategoria(doce.categoria);
    setPreco(doce.preco.toString());
    setEstoque(doce.estoque.toString());
    setFabricadoEmMari(doce.fabricadoEmMari);
    setDialogAberto(true);
  }

  function abrirParaCriar() {
    setEditando(null);
    setNome("");
    setCategoria("");
    setPreco("");
    setEstoque("");
    setFabricadoEmMari(false);
    setDialogAberto(true);
  }

  async function salvar() {
    if (!nome || !categoria || !preco || !estoque) {
      toast.error("Preencha todos os campos");
      return;
    }

    const dados = {
      nome,
      categoria,
      preco: parsearPreco(preco),
      estoque: parseInt(estoque),
      fabricadoEmMari,
    };

    if (editando) {
      const res = await fetch(`/api/doces/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await res.json();
      if (!res.ok) {
        toast.error(resultado.erro || "Erro ao atualizar doce");
        return;
      }
      toast.success("Doce atualizado!");
    } else {
      const res = await fetch("/api/doces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await res.json();
      if (!res.ok) {
        toast.error(resultado.erro || "Erro ao cadastrar doce");
        return;
      }
      toast.success("Doce cadastrado!");
    }

    setDialogAberto(false);
    carregarDoces();
  }

  async function remover(id: number) {
    if (!confirm("Tem certeza que deseja remover este doce?")) return;

    const res = await fetch(`/api/doces/${id}`, { method: "DELETE" });
    const resultado = await res.json();
    if (!res.ok) {
      toast.error(resultado.erro || "Erro ao remover doce");
      return;
    }
    toast.success("Doce removido!");
    carregarDoces();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doces</h1>
            <p className="text-muted-foreground mt-1">Gerencie o estoque de doces</p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger render={<Button onClick={abrirParaCriar} />}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Doce
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? "Editar Doce" : "Novo Doce"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Brigadeiro"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Chocolate"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preco (R$)</Label>
                    <Input
                      id="preco"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estoque">Estoque</Label>
                    <Input
                      id="estoque"
                      type="number"
                      value={estoque}
                      onChange={(e) => setEstoque(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fabricadoEmMari"
                    checked={fabricadoEmMari}
                    onChange={(e) => setFabricadoEmMari(e.target.checked)}
                    className="h-4 w-4 accent-pink-500"
                  />
                  <Label htmlFor="fabricadoEmMari">Fabricado em Mari</Label>
                </div>
                <Button onClick={salvar} className="w-full">
                  {editando ? "Salvar Alteracoes" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* barra de pesquisa */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Pesquisar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && pesquisar()}
              />
              <Button variant="secondary" onClick={pesquisar}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              {busca && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusca("");
                    carregarDoces();
                  }}
                >
                  Limpar
                </Button>
              )}
              <Button
                variant={filtrosAbertos ? "default" : "outline"}
                onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {temFiltroAtivo && (
                  <Badge variant="secondary" className="ml-2">{
                    [filtroCategoria, filtroPrecoMin, filtroPrecoMax, filtroEstoqueBaixo].filter(Boolean).length
                  }</Badge>
                )}
              </Button>
            </div>

            {/* filtros expandiveis */}
            {filtrosAbertos && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v === "todas" ? "" : (v ?? ""))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preco minimo</Label>
                  <Input
                    placeholder="0,00"
                    value={filtroPrecoMin}
                    onChange={(e) => setFiltroPrecoMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preco maximo</Label>
                  <Input
                    placeholder="100,00"
                    value={filtroPrecoMax}
                    onChange={(e) => setFiltroPrecoMax(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border">
                    <input
                      type="checkbox"
                      id="estoqueBaixo"
                      checked={filtroEstoqueBaixo}
                      onChange={(e) => setFiltroEstoqueBaixo(e.target.checked)}
                      className="h-4 w-4 accent-pink-500"
                    />
                    <Label htmlFor="estoqueBaixo" className="text-sm whitespace-nowrap">Estoque baixo</Label>
                  </div>
                  {temFiltroAtivo && (
                    <Button variant="ghost" size="sm" onClick={limparFiltros}>Limpar</Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Estoque ({filtrados.length}{temFiltroAtivo ? ` de ${doces.length}` : ""} itens)</CardTitle>
          </CardHeader>
          <CardContent>
            {filtrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {doces.length === 0 ? "Nenhum doce cadastrado ainda." : "Nenhum doce encontrado com esses filtros."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preco</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((doce) => (
                    <TableRow key={doce.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {doce.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {doce.nome}
                        {doce.fabricadoEmMari && (
                          <Badge variant="outline" className="ml-2 text-xs">Mari</Badge>
                        )}
                      </TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setVisualizando(doce)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirParaEditar(doce)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remover(doce.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* dialog de detalhes - exibir um */}
        <Dialog open={!!visualizando} onOpenChange={() => setVisualizando(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Doce</DialogTitle>
            </DialogHeader>
            {visualizando && (
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono">{visualizando.id}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{visualizando.nome}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Categoria</span>
                  <Badge variant="secondary">{visualizando.categoria}</Badge>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Preco</span>
                  <span className="font-medium">{formatarPreco(visualizando.preco)}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Estoque</span>
                  {visualizando.estoque < 5 ? (
                    <Badge variant="destructive">{visualizando.estoque} unidades</Badge>
                  ) : (
                    <span>{visualizando.estoque} unidades</span>
                  )}
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Fabricado em Mari</span>
                  <span>{visualizando.fabricadoEmMari ? "Sim" : "Nao"}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}