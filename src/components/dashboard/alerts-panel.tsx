"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Wrench } from "lucide-react"
import { memo, useMemo } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export const AlertsPanel = memo(function AlertsPanel() {
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
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Vencida",
            description: `${vehicle.plate} - ${vehicle.model} - Manutenção vencida há ${Math.abs(daysUntilMaintenance)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilMaintenance <= 7) {
          alertsList.push({
            id: `maintenance-due-${vehicle.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Próxima",
            description: `${vehicle.plate} - ${vehicle.model} - Revisão em ${daysUntilMaintenance} dias`,
            time: "Atenção",
          })
        }
      }
    })
    
    // Alertas de equipamentos disponíveis
    const availableEquipment = equipment.filter(eq => eq.status === 'available')
    if (availableEquipment.length > 0) {
      alertsList.push({
        id: "equipment-available",
        type: "info",
        icon: Wrench,
        title: "Equipamentos Disponíveis",
        description: `${availableEquipment.length} equipamentos disponíveis no almoxarifado`,
        time: "Info",
      })
    }
    
    return alertsList.slice(0, 5) // Limitar a 5 alertas
  }, [employees, equipment, vehicles])

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
