"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Users, Truck, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useState } from "react"
 

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Colaboradores",
    href: "/dashboard/colaboradores",
    icon: Users,
  },
  {
    name: "Equipamentos",
    href: "/dashboard/equipamentos",
    icon: Package,
  },
  {
    name: "Veículos",
    href: "/dashboard/veiculos",
    icon: Truck,
  },
  {
    name: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileText,
  },
  {
    name: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden md:block h-full",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} p-4`}>
          {!isCollapsed ? (
            <div className="flex flex-col">
              <Logo className="[&>img]:h-8 [&>img]:w-8" />
              <span className="text-xs text-muted-foreground mt-1">Engenharia e Manutenção</span>
            </div>
          ) : (
            <div></div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer h-8 w-8 flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Logo for collapsed state - between arrow and navigation */}
        {isCollapsed && (
          <div className="flex justify-center p-2">
            <img src="/images/maffeng-logo.png" alt="MAFFENG" className="h-6 w-6 object-contain" />
          </div>
        )}

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                  isActive
                    ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-lg scale-105"
                    : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-700 hover:shadow-md",
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                  isActive ? "text-gray-800" : "text-sidebar-foreground group-hover:text-gray-600"
                )} />
                {!isCollapsed && <span className="transition-all duration-300">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        
        {/* Espaço vazio para preencher o resto da altura */}
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
