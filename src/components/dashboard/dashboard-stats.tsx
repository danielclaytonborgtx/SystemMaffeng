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
        <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-gray-700 transition-colors duration-300">{stat.title}</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
              <stat.icon className={`h-4 w-4 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-gray-600 transition-colors duration-300">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
