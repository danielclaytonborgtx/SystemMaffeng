"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Wrench, Users } from "lucide-react"

export function AlertsPanel() {
  const alerts = [
    {
      id: 1,
      type: "critical",
      category: "manutenção",
      title: "Manutenção Vencida - Caminhão ABC-1234",
      description: "Troca de óleo vencida há 5 dias",
      icon: Wrench,
      time: "há 2 horas",
    },
    {
      id: 2,
      type: "warning",
      category: "equipamento",
      title: "Equipamento em Atraso",
      description: "Furadeira elétrica não devolvida por João Silva",
      icon: AlertTriangle,
      time: "há 1 dia",
    },
    {
      id: 3,
      type: "info",
      category: "preventiva",
      title: "Manutenção Preventiva Programada",
      description: "Revisão geral do veículo XYZ-5678 em 3 dias",
      icon: Clock,
      time: "há 3 horas",
    },
    {
      id: 4,
      type: "warning",
      category: "colaborador",
      title: "Colaborador Inativo",
      description: "Maria Santos sem movimentação há 7 dias",
      icon: Users,
      time: "há 6 horas",
    },
  ]

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas do Sistema
        </CardTitle>
        <CardDescription>Monitoramento em tempo real de situações que requerem atenção</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <alert.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant={getAlertColor(alert.type)} className="text-xs">
                    {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Atenção" : "Info"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Resolver
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full bg-transparent cursor-pointer">
            Ver Todos os Alertas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
