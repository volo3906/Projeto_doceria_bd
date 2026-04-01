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
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Cliente } from "@/lib/types";
import { formatarCpf, formatarTelefone, mascaraCpf, mascaraTelefone } from "@/lib/utils";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [visualizando, setVisualizando] = useState<Cliente | null>(null);

  // campos do formulario
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [torceFlamengo, setTorceFlamengo] = useState(false);
  const [assisteOnePiece, setAssisteOnePiece] = useState(false);
  const [deSousa, setDeSousa] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const res = await fetch("/api/clientes");
      if (!res.ok) {
        toast.error("Erro ao carregar clientes");
        return;
      }
      const dados = await res.json();
      setClientes(dados);
    } catch {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  async function pesquisar() {
    if (!busca.trim()) {
      carregarClientes();
      return;
    }
    try {
      const res = await fetch(`/api/clientes?nome=${busca}`);
      if (!res.ok) {
        toast.error("Erro ao pesquisar");
        return;
      }
      const dados = await res.json();
      setClientes(dados);
    } catch {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  function abrirParaEditar(cliente: Cliente) {
    setEditando(cliente);
    setNome(cliente.nome);
    setCpf(formatarCpf(cliente.cpf));
    setEmail(cliente.email);
    setTelefone(formatarTelefone(cliente.telefone));
    setTorceFlamengo(cliente.torceFlamengo);
    setAssisteOnePiece(cliente.assisteOnePiece);
    setDeSousa(cliente.deSousa);
    setDialogAberto(true);
  }

  function abrirParaCriar() {
    setEditando(null);
    setNome("");
    setCpf("");
    setEmail("");
    setTelefone("");
    setTorceFlamengo(false);
    setAssisteOnePiece(false);
    setDeSousa(false);
    setDialogAberto(true);
  }

  async function salvar() {
    if (!nome || !cpf || !email || !telefone) {
      toast.error("Preencha todos os campos");
      return;
    }

    // valida formato de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email invalido");
      return;
    }

    const dados = {
      nome,
      cpf,
      email,
      telefone,
      torceFlamengo,
      assisteOnePiece,
      deSousa,
    };

    if (editando) {
      const res = await fetch(`/api/clientes/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await res.json();
      if (!res.ok) {
        toast.error(resultado.erro || "Erro ao atualizar cliente");
        return;
      }
      toast.success("Cliente atualizado!");
    } else {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await res.json();
      if (!res.ok) {
        toast.error(resultado.erro || "Erro ao cadastrar cliente");
        return;
      }
      toast.success("Cliente cadastrado!");
    }

    setDialogAberto(false);
    carregarClientes();
  }

  async function remover(id: number) {
    if (!confirm("Tem certeza que deseja remover este cliente?")) return;

    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    const resultado = await res.json();
    if (!res.ok) {
      toast.error(resultado.erro || "Erro ao remover cliente");
      return;
    }
    toast.success("Cliente removido!");
    carregarClientes();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">Gerencie os clientes da doceria</p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger render={<Button onClick={abrirParaCriar} />}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Joao Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    disabled={!!editando}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                    placeholder="+55 (83) 99999-0001"
                    maxLength={19}
                  />
                </div>

                {/* checkboxes de desconto (Parte 2) */}
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium text-muted-foreground">Desconto especial</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="torceFlamengo"
                      checked={torceFlamengo}
                      onChange={(e) => setTorceFlamengo(e.target.checked)}
                      className="h-4 w-4 accent-pink-500"
                    />
                    <Label htmlFor="torceFlamengo">Torce pro Flamengo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="assisteOnePiece"
                      checked={assisteOnePiece}
                      onChange={(e) => setAssisteOnePiece(e.target.checked)}
                      className="h-4 w-4 accent-pink-500"
                    />
                    <Label htmlFor="assisteOnePiece">Assiste One Piece</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="deSousa"
                      checked={deSousa}
                      onChange={(e) => setDeSousa(e.target.checked)}
                      className="h-4 w-4 accent-pink-500"
                    />
                    <Label htmlFor="deSousa">Eh de Sousa</Label>
                  </div>
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
                    carregarClientes();
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes ({clientes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cliente cadastrado ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {cliente.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cliente.nome}
                        {(cliente.torceFlamengo || cliente.assisteOnePiece || cliente.deSousa) && (
                          <Badge variant="secondary" className="ml-2 text-xs">Desconto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">{formatarCpf(cliente.cpf)}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{formatarTelefone(cliente.telefone)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/clientes/${cliente.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirParaEditar(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remover(cliente.id)}
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
              <DialogTitle>Detalhes do Cliente</DialogTitle>
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
                  <span className="text-muted-foreground">CPF</span>
                  <span className="font-mono">{formatarCpf(visualizando.cpf)}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Email</span>
                  <span>{visualizando.email}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Telefone</span>
                  <span>{formatarTelefone(visualizando.telefone)}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Flamengo</span>
                  <span>{visualizando.torceFlamengo ? "Sim" : "Nao"}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">One Piece</span>
                  <span>{visualizando.assisteOnePiece ? "Sim" : "Nao"}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">De Sousa</span>
                  <span>{visualizando.deSousa ? "Sim" : "Nao"}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
