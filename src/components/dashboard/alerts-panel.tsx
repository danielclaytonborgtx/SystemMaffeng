"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Wrench, Shield, FileText, ArrowRight } from "lucide-react"
import { memo, useMemo } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const AlertsPanel = memo(function AlertsPanel() {
  const router = useRouter()
  const { data: employees } = useEmployees()
  const { data: equipment } = useEquipment()
  const { data: vehicles } = useVehicles()

  const alerts = useMemo(() => {
    const alertsList = []
    const today = new Date()
    
    // Alertas de manutenção vencida
    vehicles.forEach(vehicle => {
      if (vehicle.nextMaintenance && vehicle.currentKm && vehicle.maintenanceKm) {
        const nextMaintenanceDate = vehicle.nextMaintenance.toDate()
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

    // Alertas de seguro vencido
    vehicles.forEach(vehicle => {
      if (vehicle.insuranceExpiry) {
        const insuranceDate = new Date(vehicle.insuranceExpiry)
        const daysUntilInsurance = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilInsurance < 0) {
          alertsList.push({
            id: `insurance-overdue-${vehicle.id}`,
            type: "urgent",
            icon: Shield,
            title: "Seguro Vencido",
            description: `${vehicle.plate} - ${vehicle.model} - Seguro vencido há ${Math.abs(daysUntilInsurance)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilInsurance <= 30) {
          alertsList.push({
            id: `insurance-due-${vehicle.id}`,
            type: "warning",
            icon: Shield,
            title: "Seguro Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model} - Seguro vence em ${daysUntilInsurance} dias`,
            time: "Atenção",
          })
        }
      }
    })

    // Alertas de licenciamento próximo
    vehicles.forEach(vehicle => {
      if (vehicle.licenseExpiry) {
        const licenseDate = new Date(vehicle.licenseExpiry)
        const daysUntilLicense = Math.ceil((licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilLicense < 0) {
          alertsList.push({
            id: `license-overdue-${vehicle.id}`,
            type: "urgent",
            icon: FileText,
            title: "Licenciamento Vencido",
            description: `${vehicle.plate} - ${vehicle.model} - Licenciamento vencido há ${Math.abs(daysUntilLicense)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilLicense <= 30) {
          alertsList.push({
            id: `license-due-${vehicle.id}`,
            type: "warning",
            icon: FileText,
            title: "Licenciamento Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model} - Licenciamento vence em ${daysUntilLicense} dias`,
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
    
    // Ordenar alertas por prioridade (urgent primeiro, depois warning, depois info)
    const sortedAlerts = alertsList.sort((a, b) => {
      const priority = { urgent: 0, warning: 1, info: 2 }
      return priority[a.type] - priority[b.type]
    })
    
    return sortedAlerts.slice(0, 3) // Limitar a 3 alertas
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
        
        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
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
        )}
      </CardContent>
    </Card>
  )
})
