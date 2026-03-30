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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Vendedor } from "@/lib/types";
import { formatarCpf, formatarTelefone, mascaraCpf, mascaraTelefone } from "@/lib/utils";

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visualizando, setVisualizando] = useState<Vendedor | null>(null);

  // campos do formulario
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    carregarVendedores();
  }, []);

  async function carregarVendedores() {
    try {
      const res = await fetch("/api/vendedores");

      if (!res.ok) {
        toast.error("Erro ao carregar vendedores");
        return;
      }

      setVendedores(await res.json());
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor");
      console.error(erro);
    }
  }

  async function cadastrarVendedor() {
    if (!nome || !email || !telefone || !cpf) {
      toast.error("Preencha todos os campos");
      return;
    }

    // valida formato de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email invalido");
      return;
    }

    // valida CPF (11 digitos, pode vir formatado)
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) {
      toast.error("CPF invalido: informe 11 digitos");
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/vendedores/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, telefone, cpf }),
        });
      } else {
        res = await fetch("/api/vendedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, telefone, cpf }),
        });
      }

      if (!res.ok) {
        try {
          const dados = await res.json();
          toast.error(dados.erro || (editingId ? "Erro ao atualizar vendedor" : "Erro ao cadastrar vendedor"));
        } catch {
          toast.error(`Erro ao ${editingId ? 'atualizar' : 'cadastrar'} vendedor (${res.status})`);
        }
        return;
      }

      toast.success(editingId ? "Vendedor atualizado!" : "Vendedor cadastrado!");
      setDialogAberto(false);
      setNome("");
      setEmail("");
      setTelefone("");
      setCpf("");
      setEditingId(null);
      carregarVendedores();
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor");
      console.error(erro);
    }
  }

  async function removerVendedor(id: number) {
    if (!confirm("Tem certeza que deseja remover este vendedor?")) return;

    try {
      const res = await fetch(`/api/vendedores/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Erro ao remover vendedor");
        return;
      }

      toast.success("Vendedor removido!");
      carregarVendedores();
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor");
      console.error(erro);
    }
  }

  function abrirEdicao(v: Vendedor) {
    setEditingId(v.id);
    setNome(v.nome);
    setEmail(v.email);
    setTelefone(formatarTelefone(v.telefone));
    setCpf(formatarCpf(v.cpf));
    setDialogAberto(true);
  }

  return (
    <AppLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendedores</CardTitle>
          <Dialog open={dialogAberto} onOpenChange={(open) => {
            setDialogAberto(open);
            if (!open) {
              setEditingId(null);
              setNome("");
              setEmail("");
              setTelefone("");
              setCpf("");
            }
          }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Vendedor
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Vendedor' : 'Cadastrar Novo Vendedor'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do vendedor"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
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
                <Button onClick={cadastrarVendedor} className="w-full">
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
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
              {vendedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Nenhum vendedor cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                vendedores.map((vendedor) => (
                  <TableRow key={vendedor.id}>
                    <TableCell className="font-mono text-muted-foreground">{vendedor.id}</TableCell>
                    <TableCell className="font-medium">{vendedor.nome}</TableCell>
                    <TableCell className="font-mono">{formatarCpf(vendedor.cpf)}</TableCell>
                    <TableCell>{vendedor.email}</TableCell>
                    <TableCell>{formatarTelefone(vendedor.telefone)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setVisualizando(vendedor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicao(vendedor)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removerVendedor(vendedor.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* dialog de detalhes do vendedor */}
      <Dialog open={!!visualizando} onOpenChange={() => setVisualizando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Vendedor</DialogTitle>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
