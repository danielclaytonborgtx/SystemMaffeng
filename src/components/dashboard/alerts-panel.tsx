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
    <Card className="border shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Alertas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
            <div className={`p-2 rounded-full ${
              alert.type === "urgent"
                ? "bg-red-500/20"
                : alert.type === "warning"
                  ? "bg-yellow-500/20"
                  : "bg-blue-500/20"
            }`}>
              <alert.icon
                className={`h-5 w-5 ${
                  alert.type === "urgent"
                    ? "text-red-500"
                    : alert.type === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                }`}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{alert.title}</p>
                <Badge
                  className={`${
                    alert.type === "urgent" 
                      ? "bg-red-500 text-white" 
                      : alert.type === "warning" 
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                  }`}
                >
                  {alert.type === "urgent" ? "Urgente" : alert.type === "warning" ? "Atenção" : "Info"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.description}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
