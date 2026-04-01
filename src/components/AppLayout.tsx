"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ehAdmin = pathname.startsWith("/admin");

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <SidebarTrigger />
          <Link href={ehAdmin ? "/cliente" : "/admin"}>
            <Button variant="outline" size="sm">
              {ehAdmin ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Ir para Cliente
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Ir para Admin
                </>
              )}
            </Button>
          </Link>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
