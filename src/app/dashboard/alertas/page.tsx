"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Wrench, Shield, FileText, Users, RefreshCw, CheckCircle, Loader2, Package } from "lucide-react"
import { useMemo, useState } from "react"
import { useEmployees, useEquipment, useVehicles, useEquipmentMovements, useVehicleScheduledMaintenances } from "@/hooks"
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog"
import { MaintenanceDialog } from "@/components/vehicles/maintenance-dialog"
import { Vehicle } from "@/lib/supabase"

interface Alert {
  id: string
  type: string
  category: string
  icon: any
  title: string
  description: string
  time: string
  vehicle?: Vehicle
}

export default function AlertasPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const { data: employees, loading: employeesLoading, refetch: refetchEmployees } = useEmployees()
  const { data: equipment, loading: equipmentLoading, refetch: refetchEquipment } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading, refetch: refetchVehicles } = useVehicles()
  const { data: movements, loading: movementsLoading, refetch: refetchMovements } = useEquipmentMovements()
  const { data: scheduledMaintenances, loading: scheduledMaintenancesLoading, refetch: refetchScheduledMaintenances } = useVehicleScheduledMaintenances()

  // Loading geral - qualquer hook carregando
  const loading = employeesLoading || equipmentLoading || vehiclesLoading || movementsLoading || scheduledMaintenancesLoading

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchEmployees(), refetchEquipment(), refetchVehicles(), refetchMovements(), refetchScheduledMaintenances()])
    } finally {
      setRefreshing(false)
    }
  }

  const alerts = useMemo((): Alert[] => {
    const alertsList: Alert[] = []
    const today = new Date()
    
    console.log('=== DEBUG ALERTAS ===')
    console.log('Veículos carregados:', vehicles.length)
    console.log('Manutenções programadas carregadas:', scheduledMaintenances.length)
    console.log('Dados das manutenções programadas:', scheduledMaintenances)
    
    // Alertas de manutenção por quilometragem e data
    vehicles.forEach(vehicle => {
      if (vehicle.current_km && vehicle.maintenance_km) {
        const kmUntilMaintenance = vehicle.maintenance_km - vehicle.current_km
        
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
      
      // Alerta por data (se existir next_maintenance)
      if (vehicle.next_maintenance) {
        const nextMaintenanceDate = new Date(vehicle.next_maintenance)
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

    // Alertas de manutenções programadas vencidas
    console.log('Processando manutenções programadas:', scheduledMaintenances.length)
    console.log('IDs dos veículos:', vehicles.map(v => ({ id: v.id, plate: v.plate })))
    console.log('IDs das manutenções programadas:', scheduledMaintenances.map(sm => ({ id: sm.id, vehicle_id: sm.vehicle_id })))
    
    vehicles.forEach(vehicle => {
      const vehicleScheduledMaintenances = scheduledMaintenances.filter(sm => {
        const match = String(sm.vehicle_id) === String(vehicle.id) && sm.is_active
        console.log(`Comparando: ${sm.vehicle_id} === ${vehicle.id} = ${match}`)
        return match
      })
      console.log(`Veículo ${vehicle.plate} (${vehicle.id}) tem ${vehicleScheduledMaintenances.length} manutenções programadas ativas`)
      
      vehicleScheduledMaintenances.forEach(scheduledMaintenance => {
        const currentKm = vehicle.current_km || 0
        const kmUntilMaintenance = scheduledMaintenance.next_maintenance_km - currentKm
        
        console.log(`Manutenção ${scheduledMaintenance.maintenance_name}: KM atual ${currentKm}, próximo ${scheduledMaintenance.next_maintenance_km}, diferença ${kmUntilMaintenance}`)
        
        // Alerta por quilometragem das manutenções programadas
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          alertsList.push({
            id: `scheduled-maintenance-km-${scheduledMaintenance.id}`,
            type: "warning",
            category: "manutenção",
            icon: Clock,
            title: "Manutenção Programada Próxima",
            description: `${vehicle.plate} - ${vehicle.model} - ${scheduledMaintenance.maintenance_name} em ${kmUntilMaintenance} km`,
            time: "Atenção",
            vehicle: vehicle,
          })
        } else if (kmUntilMaintenance <= 0) {
          alertsList.push({
            id: `scheduled-maintenance-overdue-km-${scheduledMaintenance.id}`,
            type: "urgent",
            category: "manutenção",
            icon: AlertTriangle,
            title: "Manutenção Programada Vencida",
            description: `${vehicle.plate} - ${vehicle.model} - ${scheduledMaintenance.maintenance_name} vencida há ${Math.abs(kmUntilMaintenance)} km`,
            time: "Urgente",
            vehicle: vehicle,
          })
        }
      })
    })
    
    console.log(`Total de alertas de manutenções programadas adicionados: ${alertsList.filter(a => a.id.includes('scheduled-maintenance')).length}`)

    // Alertas de seguro vencido
    vehicles.forEach(vehicle => {
      if (vehicle.insurance_expiry) {
        console.log(`Verificando seguro do veículo ${vehicle.plate}:`, vehicle.insurance_expiry)
        const insuranceDate = new Date(vehicle.insurance_expiry)
        const daysUntilInsurance = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`Dias até vencimento do seguro: ${daysUntilInsurance}`)
        
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
      if (vehicle.license_expiry) {
        console.log(`Verificando licenciamento do veículo ${vehicle.plate}:`, vehicle.license_expiry)
        const licenseDate = new Date(vehicle.license_expiry)
        const daysUntilLicense = Math.ceil((licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`Dias até vencimento do licenciamento: ${daysUntilLicense}`)
        
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

    // Alertas de devolução de equipamentos
    movements.forEach(movement => {
      // Verificar apenas movimentações de saída que ainda não foram devolvidas
      if (movement.type === 'out' && !movement.actual_return_date && movement.expected_return_date) {
        const expectedReturnDate = new Date(movement.expected_return_date)
        const daysUntilReturn = Math.ceil((expectedReturnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        // Alerta 5 dias antes da data prevista
        if (daysUntilReturn <= 5 && daysUntilReturn >= 0) {
          alertsList.push({
            id: `equipment-return-${movement.id}`,
            type: "warning",
            category: "equipamento",
            icon: Package,
            title: "Devolução de Equipamento Próxima",
            description: `${movement.equipment_name} (${movement.equipment_code}) - Devolução prevista em ${daysUntilReturn} dias - Projeto: ${movement.project}`,
            time: "Atenção",
          })
        } else if (daysUntilReturn < 0) {
          // Alerta de devolução em atraso
          alertsList.push({
            id: `equipment-return-overdue-${movement.id}`,
            type: "urgent",
            category: "equipamento",
            icon: AlertTriangle,
            title: "Devolução de Equipamento em Atraso",
            description: `${movement.equipment_name} (${movement.equipment_code}) - Devolução em atraso há ${Math.abs(daysUntilReturn)} dias - Projeto: ${movement.project}`,
            time: "Urgente",
          })
        }
      }
    })
    
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
      const priority: { [key: string]: number } = { urgent: 0, warning: 1, info: 2 }
      return priority[a.type] - priority[b.type]
    })
    
    console.log('Total de alertas gerados:', sortedAlerts.length)
    console.log('Alertas:', sortedAlerts)
    console.log('=== FIM DEBUG ALERTAS ===')
    
    return sortedAlerts
  }, [employees, equipment, vehicles, movements, scheduledMaintenances])

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

  const handleResolveAlert = (alert: any) => {
    if (alert.vehicle) {
      setSelectedVehicle(alert.vehicle)
      
      // Determinar qual dialog abrir baseado no tipo de alerta
      if (alert.category === "manutenção") {
        setIsMaintenanceDialogOpen(true)
      } else if (alert.category === "documentação") {
        setIsVehicleDialogOpen(true)
      } else {
        // Para outros tipos, abrir o dialog do veículo
        setIsVehicleDialogOpen(true)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Alertas do Sistema</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitore todos os alertas e notificações do sistema</p>
        </div>        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Urgentes</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-500 mt-1">
              {loading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : alerts.filter(a => a.type === 'urgent').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Atenção</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500 mt-1">
              {loading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : alerts.filter(a => a.type === 'warning').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Informativos</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-500 mt-1">
              {loading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : alerts.filter(a => a.type === 'info').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            Todos os Alertas ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-muted/30">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="h-4 w-32 sm:w-48 bg-muted animate-pulse rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-14 sm:w-16 bg-muted animate-pulse rounded"></div>
                        <div className="h-6 w-16 sm:w-20 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="h-3 w-48 sm:w-64 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="h-3 w-14 sm:w-16 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-20 sm:w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-8 w-16 sm:w-20 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-muted-foreground mb-4">
                <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg sm:text-xl font-medium">Nenhum alerta ativo</p>
                <p className="text-xs sm:text-sm">O sistema está funcionando normalmente</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {alerts.map((alert) => {
                const IconComponent = alert.icon
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 sm:p-3 rounded-full ${
                      alert.type === "urgent"
                        ? "bg-red-500/20"
                        : alert.type === "warning"
                          ? "bg-yellow-500/20"
                          : "bg-blue-500/20"
                    }`}>
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          alert.type === "urgent"
                            ? "text-red-500"
                            : alert.type === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{alert.title}</h4>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          {getAlertBadge(alert.type)}
                          {getCategoryBadge(alert.category)}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        {alert.vehicle && (
                          <span className="text-xs text-muted-foreground truncate">
                            Veículo: {alert.vehicle.plate}
                          </span>
                        )}
                      </div>
                    </div>
                    {alert.vehicle && (
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleResolveAlert(alert)}
                          className="cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Resolver</span>
                          <span className="sm:hidden">OK</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VehicleDialog
        open={isVehicleDialogOpen}
        onOpenChange={setIsVehicleDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsVehicleDialogOpen(false)
        }}
        onSuccess={() => {
          refetchVehicles() // Recarregar a lista de veículos
        }}
      />

      <MaintenanceDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsMaintenanceDialogOpen(false)
        }}
        onSuccess={() => {
          refetchVehicles() // Recarregar a lista de veículos
        }}
      />
    </div>
  )
}
