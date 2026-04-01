"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, ShieldCheck, User } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Cake className="h-10 w-10 text-pink-500" />
          <h1 className="text-4xl font-bold">Doceria Gourmet</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Selecione como deseja acessar o sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl w-full">
        <Link href="/cliente">
          <Card className="cursor-pointer hover:border-pink-300 hover:shadow-lg transition-all h-full">
            <CardHeader className="text-center pb-2">
              <User className="h-12 w-12 text-pink-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Sou Cliente</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Ver catalogo de doces, consultar seus dados e historico de compras</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all h-full">
            <CardHeader className="text-center pb-2">
              <ShieldCheck className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Sou Administrador</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Gerenciar doces, clientes, vendedores, registrar vendas e ver relatorios</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
