import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Wrench } from "lucide-react"
import { memo, useMemo } from "react"

export const AlertsPanel = memo(function AlertsPanel() {
  const alerts = useMemo(() => [
    {
      id: 1,
      type: "urgent",
      icon: AlertTriangle,
      title: "Manutenção Vencida",
      description: "Caminhão ABC-1234 - Troca de óleo vencida há 3 dias",
      time: "2 horas atrás",
    },
    {
      id: 2,
      type: "warning",
      icon: Clock,
      title: "Manutenção Próxima",
      description: "Escavadeira XYZ-5678 - Revisão em 5 dias",
      time: "1 dia atrás",
    },
    {
      id: 3,
      type: "info",
      icon: Wrench,
      title: "Equipamento Devolvido",
      description: "Furadeira elétrica devolvida por João Silva",
      time: "3 horas atrás",
    },
  ], [])

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Alertas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border-0 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group">
            <div className={`p-2 rounded-full ${
              alert.type === "urgent"
                ? "bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300"
                : alert.type === "warning"
                  ? "bg-gradient-to-br from-yellow-100 to-yellow-200 group-hover:from-yellow-200 group-hover:to-yellow-300"
                  : "bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300"
            } transition-all duration-300`}>
              <alert.icon
                className={`h-5 w-5 ${
                  alert.type === "urgent"
                    ? "text-red-600"
                    : alert.type === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
                } group-hover:scale-110 transition-transform duration-300`}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm group-hover:text-gray-800 transition-colors duration-300">{alert.title}</p>
                <Badge
                  className={`${
                    alert.type === "urgent" 
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700" 
                      : alert.type === "warning" 
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  } transition-all duration-300 transform hover:scale-105`}
                >
                  {alert.type === "urgent" ? "Urgente" : alert.type === "warning" ? "Atenção" : "Info"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-gray-600 transition-colors duration-300">{alert.description}</p>
              <p className="text-xs text-muted-foreground group-hover:text-gray-500 transition-colors duration-300">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
