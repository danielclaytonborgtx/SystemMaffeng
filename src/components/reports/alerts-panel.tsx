"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Wrench, Users, Shield, FileText, ArrowRight } from "lucide-react"
import { useAlerts } from "@/hooks"
import { useRouter } from "next/navigation"

export function AlertsPanel() {
  const router = useRouter()
  const { alerts: allAlerts } = useAlerts()
  
  // Limitar a 3 alertas para exibição no painel
  const alerts = allAlerts.slice(0, 3)
  
  // Mapear ícones para cada alerta
  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'manutenção':
        return Wrench
      case 'documentação':
        return FileText
      case 'equipamento':
        return AlertTriangle
      case 'colaborador':
        return Users
      default:
        return Clock
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "critical":
        return <Badge className="bg-red-500 text-white">Crítico</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 text-white">Atenção</Badge>
      case "info":
        return <Badge className="bg-blue-500 text-white">Info</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas do Sistema
        </CardTitle>
        <CardDescription>
          {alerts.length > 0 
            ? `${alerts.length} alerta(s) ativo(s)` 
            : "Nenhum alerta ativo no momento"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Sistema funcionando normalmente</p>
              <p className="text-sm">Não há alertas críticos no momento</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.category)
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30"
                >
                  <div className="p-2 rounded-full bg-red-500/20">
                    <IconComponent className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {alert.category}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/alertas')}
            className="w-full cursor-pointer"
          >
            Ver Todos os Alertas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}