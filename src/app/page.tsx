"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Users, ShoppingCart, DollarSign } from "lucide-react";

export default function HomePage() {
  const [relatorio, setRelatorio] = useState({
    totalDoces: 0,
    totalClientes: 0,
    totalVendas: 0,
    valorEstoque: 0,
    totalVendido: 0,
  });

  useEffect(() => {
    carregarRelatorio();
  }, []);

  async function carregarRelatorio() {
    try {
      const res = await fetch("/api/relatorio");
      if (!res.ok) {
        console.error("Erro ao carregar relatório");
        return;
      }
      const dados = await res.json();
      setRelatorio(dados);
    } catch (erro) {
      console.error("Erro ao conectar com o servidor:", erro);
    }
  }

  const cards = [
    {
      titulo: "Doces Cadastrados",
      valor: relatorio.totalDoces,
      icone: Cake,
      cor: "text-pink-500",
    },
    {
      titulo: "Clientes",
      valor: relatorio.totalClientes,
      icone: Users,
      cor: "text-blue-500",
    },
    {
      titulo: "Vendas Realizadas",
      valor: relatorio.totalVendas,
      icone: ShoppingCart,
      cor: "text-green-500",
    },
    {
      titulo: "Total Vendido",
      valor: `R$ ${relatorio.totalVendido.toFixed(2)}`,
      icone: DollarSign,
      cor: "text-emerald-500",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Doceria Gourmet</h1>
          <p className="text-muted-foreground mt-1">Painel de controle do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.titulo}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.titulo}</CardTitle>
                <card.icone className={`h-5 w-5 ${card.cor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.valor}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Valor em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pink-500">
              R$ {relatorio.valorEstoque.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Valor total dos produtos em estoque
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
