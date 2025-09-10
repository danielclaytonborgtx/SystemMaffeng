"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Wrench, Users } from "lucide-react"
import { useMemo } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export function AlertsPanel() {
  const { data: employees } = useEmployees()
  const { data: equipment } = useEquipment()
  const { data: vehicles } = useVehicles()

  const alerts = useMemo(() => {
    const alertsList = []
    
    // Alertas de manutenção vencida
    vehicles.forEach(vehicle => {
      if (vehicle.nextMaintenance && vehicle.currentKm && vehicle.maintenanceKm) {
        const nextMaintenanceDate = vehicle.nextMaintenance.toDate()
        const today = new Date()
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilMaintenance < 0) {
          alertsList.push({
            id: `maintenance-overdue-${vehicle.id}`,
            type: "critical",
            category: "manutenção",
            title: `Manutenção Vencida - ${vehicle.plate}`,
            description: `${vehicle.model} - Manutenção vencida há ${Math.abs(daysUntilMaintenance)} dias`,
            icon: Wrench,
            time: "Urgente",
          })
        } else if (daysUntilMaintenance <= 7) {
          alertsList.push({
            id: `maintenance-due-${vehicle.id}`,
            type: "warning",
            category: "manutenção",
            title: `Manutenção Próxima - ${vehicle.plate}`,
            description: `${vehicle.model} - Revisão em ${daysUntilMaintenance} dias`,
            icon: Clock,
            time: "Atenção",
          })
        }
      }
    })
    
    // Alertas de equipamentos em manutenção
    const maintenanceEquipment = equipment.filter(eq => eq.status === 'maintenance')
    if (maintenanceEquipment.length > 0) {
      alertsList.push({
        id: "equipment-maintenance",
        type: "warning",
        category: "equipamento",
        title: "Equipamentos em Manutenção",
        description: `${maintenanceEquipment.length} equipamentos em manutenção`,
        icon: AlertTriangle,
        time: "Info",
      })
    }
    
    // Alertas de colaboradores em férias
    const vacationEmployees = employees.filter(emp => emp.status === 'vacation')
    if (vacationEmployees.length > 0) {
      alertsList.push({
        id: "employees-vacation",
        type: "info",
        category: "colaborador",
        title: "Colaboradores em Férias",
        description: `${vacationEmployees.length} colaboradores em férias`,
        icon: Users,
        time: "Info",
      })
    }
    
    return alertsList.slice(0, 5) // Limitar a 5 alertas
  }, [employees, equipment, vehicles])

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
              const IconComponent = alert.icon
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
          <Button variant="outline" size="sm" className="w-full">
            Ver Todos os Alertas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}