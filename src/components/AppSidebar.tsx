"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cake, Users, ShoppingCart, BarChart3, Home } from "lucide-react";
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
} from "@/components/ui/sidebar";

const menuItems = [
  { titulo: "Inicio", href: "/", icone: Home },
  { titulo: "Doces", href: "/doces", icone: Cake },
  { titulo: "Clientes", href: "/clientes", icone: Users },
  { titulo: "Vendas", href: "/vendas", icone: ShoppingCart },
  { titulo: "Relatorios", href: "/relatorios", icone: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

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
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const ativo = pathname === item.href;
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
    </Sidebar>
  );
}
