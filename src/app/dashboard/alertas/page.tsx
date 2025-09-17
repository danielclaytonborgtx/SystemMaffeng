"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Wrench, Shield, FileText, Users, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export default function AlertasPage() {
  const [refreshing, setRefreshing] = useState(false)
  const { data: employees, refetch: refetchEmployees } = useEmployees()
  const { data: equipment, refetch: refetchEquipment } = useEquipment()
  const { data: vehicles, refetch: refetchVehicles } = useVehicles()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchEmployees(), refetchEquipment(), refetchVehicles()])
    } finally {
      setRefreshing(false)
    }
  }

  const alerts = useMemo(() => {
    const alertsList = []
    const today = new Date()
    
    // Alertas de manutenção por quilometragem e data
    vehicles.forEach(vehicle => {
      if (vehicle.currentKm && vehicle.maintenanceKm) {
        const kmUntilMaintenance = vehicle.maintenanceKm - vehicle.currentKm
        
        // Alerta por quilometragem (1000km antes da manutenção)
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          alertsList.push({
            id: `maintenance-km-${vehicle.id}`,
            type: "warning",
            category: "manutenção",
            icon: Clock,
            title: "Manutenção Próxima por KM",
            description: `${vehicle.plate} - ${vehicle.model} - Faltam ${kmUntilMaintenance} km para manutenção`,
            time: "Atenção",
            vehicle: vehicle,
          })
        } else if (kmUntilMaintenance <= 0) {
          alertsList.push({
            id: `maintenance-overdue-km-${vehicle.id}`,
            type: "urgent",
            category: "manutenção",
            icon: AlertTriangle,
            title: "Manutenção Vencida por KM",
            description: `${vehicle.plate} - ${vehicle.model} - Manutenção vencida há ${Math.abs(kmUntilMaintenance)} km`,
            time: "Urgente",
            vehicle: vehicle,
          })
        }
      }
      
      // Alerta por data (se existir nextMaintenance)
      if (vehicle.nextMaintenance) {
        const nextMaintenanceDate = vehicle.nextMaintenance.toDate()
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilMaintenance < 0) {
          alertsList.push({
            id: `maintenance-overdue-date-${vehicle.id}`,
            type: "urgent",
            category: "manutenção",
            icon: AlertTriangle,
            title: "Manutenção Vencida por Data",
            description: `${vehicle.plate} - ${vehicle.model} - Manutenção vencida há ${Math.abs(daysUntilMaintenance)} dias`,
            time: "Urgente",
            vehicle: vehicle,
          })
        } else if (daysUntilMaintenance <= 7) {
          alertsList.push({
            id: `maintenance-due-date-${vehicle.id}`,
            type: "warning",
            category: "manutenção",
            icon: Clock,
            title: "Manutenção Próxima por Data",
            description: `${vehicle.plate} - ${vehicle.model} - Revisão em ${daysUntilMaintenance} dias`,
            time: "Atenção",
            vehicle: vehicle,
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
            category: "documentação",
            icon: Shield,
            title: "Seguro Vencido",
            description: `${vehicle.plate} - ${vehicle.model} - Seguro vencido há ${Math.abs(daysUntilInsurance)} dias`,
            time: "Urgente",
            vehicle: vehicle,
          })
        } else if (daysUntilInsurance <= 30) {
          alertsList.push({
            id: `insurance-due-${vehicle.id}`,
            type: "warning",
            category: "documentação",
            icon: Shield,
            title: "Seguro Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model} - Seguro vence em ${daysUntilInsurance} dias`,
            time: "Atenção",
            vehicle: vehicle,
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
            category: "documentação",
            icon: FileText,
            title: "Licenciamento Vencido",
            description: `${vehicle.plate} - ${vehicle.model} - Licenciamento vencido há ${Math.abs(daysUntilLicense)} dias`,
            time: "Urgente",
            vehicle: vehicle,
          })
        } else if (daysUntilLicense <= 30) {
          alertsList.push({
            id: `license-due-${vehicle.id}`,
            type: "warning",
            category: "documentação",
            icon: FileText,
            title: "Licenciamento Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model} - Licenciamento vence em ${daysUntilLicense} dias`,
            time: "Atenção",
            vehicle: vehicle,
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
        category: "equipamento",
        icon: Wrench,
        title: "Equipamentos Disponíveis",
        description: `${availableEquipment.length} equipamentos disponíveis no almoxarifado`,
        time: "Info",
      })
    }

    // Alertas de equipamentos em manutenção
    const maintenanceEquipment = equipment.filter(eq => eq.status === 'maintenance')
    if (maintenanceEquipment.length > 0) {
      alertsList.push({
        id: "equipment-maintenance",
        type: "warning",
        category: "equipamento",
        icon: AlertTriangle,
        title: "Equipamentos em Manutenção",
        description: `${maintenanceEquipment.length} equipamentos em manutenção`,
        time: "Atenção",
      })
    }
    
    // Alertas de colaboradores em férias
    const vacationEmployees = employees.filter(emp => emp.status === 'vacation')
    if (vacationEmployees.length > 0) {
      alertsList.push({
        id: "employees-vacation",
        type: "info",
        category: "colaborador",
        icon: Users,
        title: "Colaboradores em Férias",
        description: `${vacationEmployees.length} colaboradores em férias`,
        time: "Info",
      })
    }
    
    // Ordenar alertas por prioridade (urgent primeiro, depois warning, depois info)
    const sortedAlerts = alertsList.sort((a, b) => {
      const priority = { urgent: 0, warning: 1, info: 2 }
      return priority[a.type] - priority[b.type]
    })
    
    return sortedAlerts
  }, [employees, equipment, vehicles])

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "urgent":
        return <Badge className="bg-red-500 text-white">Urgente</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 text-white">Atenção</Badge>
      case "info":
        return <Badge className="bg-blue-500 text-white">Info</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      "manutenção": "bg-orange-100 text-orange-800",
      "documentação": "bg-purple-100 text-purple-800",
      "equipamento": "bg-blue-100 text-blue-800",
      "colaborador": "bg-green-100 text-green-800",
    }
    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas do Sistema</h1>
          <p className="text-muted-foreground">Monitore todos os alertas e notificações do sistema</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="cursor-pointer"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Urgentes</span>
            </div>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {alerts.filter(a => a.type === 'urgent').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Atenção</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500 mt-1">
              {alerts.filter(a => a.type === 'warning').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Informativos</span>
            </div>
            <p className="text-2xl font-bold text-blue-500 mt-1">
              {alerts.filter(a => a.type === 'info').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Todos os Alertas ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-xl font-medium">Nenhum alerta ativo</p>
                <p className="text-sm">O sistema está funcionando normalmente</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const IconComponent = alert.icon
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-3 rounded-full ${
                      alert.type === "urgent"
                        ? "bg-red-500/20"
                        : alert.type === "warning"
                          ? "bg-yellow-500/20"
                          : "bg-blue-500/20"
                    }`}>
                      <IconComponent
                        className={`h-6 w-6 ${
                          alert.type === "urgent"
                            ? "text-red-500"
                            : alert.type === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base">{alert.title}</h4>
                        {getAlertBadge(alert.type)}
                        {getCategoryBadge(alert.category)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        {alert.vehicle && (
                          <span className="text-xs text-muted-foreground">
                            Veículo: {alert.vehicle.plate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
