"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cake, Users, ShoppingCart, BarChart3, Home, User, LogOut, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuAdmin = [
  { titulo: "Dashboard", href: "/admin", icone: Home },
  { titulo: "Doces", href: "/admin/doces", icone: Cake },
  { titulo: "Clientes", href: "/admin/clientes", icone: Users },
  { titulo: "Vendedores", href: "/admin/vendedores", icone: User },
  { titulo: "Vendas", href: "/admin/vendas", icone: ShoppingCart },
  { titulo: "Relatorios", href: "/admin/relatorios", icone: BarChart3 },
];

const menuCliente = [
  { titulo: "Catalogo", href: "/cliente", icone: Cake },
  { titulo: "Comprar", href: "/cliente/comprar", icone: ShoppingCart },
  { titulo: "Meus Dados", href: "/cliente/meus-dados", icone: User },
  { titulo: "Minhas Compras", href: "/cliente/compras", icone: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const ehAdmin = pathname.startsWith("/admin");
  const items = ehAdmin ? menuAdmin : menuCliente;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Cake className="h-6 w-6 text-pink-500" />
          <span className="text-lg font-bold">Doceria Gourmet</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{ehAdmin ? "Administracao" : "Cliente"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const ativo = pathname === item.href ||
                  (item.href !== "/admin" && item.href !== "/cliente" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={ativo}>
                      <item.icone className="h-4 w-4" />
                      <span>{item.titulo}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />}>
              <LogOut className="h-4 w-4" />
              <span>Trocar perfil</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
