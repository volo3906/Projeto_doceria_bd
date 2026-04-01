"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Cliente } from "@/lib/types";
import { formatarCpf, formatarTelefone, mascaraCpf } from "@/lib/utils";

export default function MeusDadosPage() {
  const [cpfBusca, setCpfBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [buscou, setBuscou] = useState(false);

  // campos do cadastro
  const [nome, setNome] = useState("");
  const [cpfNovo, setCpfNovo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  async function buscarPorCpf() {
    if (!cpfBusca.trim()) {
      toast.error("Digite seu CPF");
      return;
    }

    // busca todos os clientes e filtra pelo CPF (digitos)
    const res = await fetch("/api/clientes");
    if (!res.ok) {
      toast.error("Erro ao buscar dados");
      return;
    }

    const clientes = await res.json();
    const digitos = cpfBusca.replace(/\D/g, "");
    const encontrado = clientes.find((c: Cliente) => c.cpf === digitos);

    if (encontrado) {
      setCliente(encontrado);
      setMostrarCadastro(false);
    } else {
      setCliente(null);
    }
    setBuscou(true);
  }

  async function cadastrar() {
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

    toast.success("Cadastrado com sucesso!");
    setCliente(dados);
    setMostrarCadastro(false);
    setBuscou(true);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Dados</h1>
          <p className="text-muted-foreground mt-1">
            Informe seu CPF para consultar seus dados cadastrais
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
                onKeyDown={(e) => e.key === "Enter" && buscarPorCpf()}
              />
              <Button onClick={buscarPorCpf}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* resultado da busca */}
        {buscou && !cliente && !mostrarCadastro && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                CPF nao encontrado. Voce ainda nao e cliente?
              </p>
              <Button onClick={() => {
                setMostrarCadastro(true);
                setCpfNovo(cpfBusca);
              }}>
                Quero me cadastrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* formulario de cadastro */}
        {mostrarCadastro && (
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Cliente</CardTitle>
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
              <Button onClick={cadastrar} className="w-full">Cadastrar</Button>
            </CardContent>
          </Card>
        )}

        {/* dados do cliente encontrado */}
        {cliente && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-green-500" />
                <CardTitle>{cliente.nome}</CardTitle>
                {(cliente.torceFlamengo || cliente.assisteOnePiece || cliente.deSousa) && (
                  <Badge variant="secondary">Desconto</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Desconto</span>
                  <span>
                    {[
                      cliente.torceFlamengo && "Flamengo",
                      cliente.assisteOnePiece && "One Piece",
                      cliente.deSousa && "Sousa",
                    ].filter(Boolean).join(", ") || "Nenhum"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
