import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Truck, AlertTriangle } from "lucide-react"
import { memo } from "react"

export const DashboardStats = memo(function DashboardStats() {
  const stats = [
    {
      title: "Equipamentos Ativos",
      value: "247",
      icon: Package,
      iconColor: "text-blue-500",
      description: "+12% em relação ao mês anterior",
    },
    {
      title: "Colaboradores",
      value: "89",
      icon: Users,
      iconColor: "text-green-500",
      description: "3 novos contratados esta semana",
    },
    {
      title: "Veículos da Frota",
      value: "32",
      icon: Truck,
      iconColor: "text-purple-500",
      description: "2 em manutenção preventiva",
    },
    {
      title: "Alertas Pendentes",
      value: "5",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      description: "3 manutenções vencidas",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border shadow-lg bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className="p-2 rounded-full bg-muted/50">
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
