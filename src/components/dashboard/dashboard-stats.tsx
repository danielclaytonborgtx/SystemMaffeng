"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Truck, AlertTriangle, Loader2 } from "lucide-react"
import { memo, useMemo } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export const DashboardStats = memo(function DashboardStats() {
  const { data: employees, loading: employeesLoading } = useEmployees()
  const { data: equipment, loading: equipmentLoading } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading } = useVehicles()

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length
    const availableEquipment = equipment.filter(eq => eq.status === 'available').length
    const activeVehicles = vehicles.filter(veh => veh.status === 'active').length
    
    // Calcular alertas de manutenção (veículos próximos da manutenção)
    const maintenanceAlerts = vehicles.filter(vehicle => {
      // Verificar por quilometragem
      if (vehicle.currentKm && vehicle.maintenanceKm) {
        const kmUntilMaintenance = vehicle.maintenanceKm - vehicle.currentKm
        if (kmUntilMaintenance <= 1000) return true
      }
      
      // Verificar por data
      if (vehicle.nextMaintenance) {
        const nextMaintenanceDate = vehicle.nextMaintenance.toDate()
        const today = new Date()
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilMaintenance <= 7) return true
      }
      
      return false
    }).length

    return [
      {
        title: "Equipamentos Disponíveis",
        value: availableEquipment.toString(),
        icon: Package,
        iconColor: "text-blue-500",
        description: `${equipment.length} total de equipamentos`,
        loading: equipmentLoading,
      },
      {
        title: "Colaboradores Ativos",
        value: activeEmployees.toString(),
        icon: Users,
        iconColor: "text-green-500",
        description: `${employees.length} total de colaboradores`,
        loading: employeesLoading,
      },
      {
        title: "Veículos Ativos",
        value: activeVehicles.toString(),
        icon: Truck,
        iconColor: "text-purple-500",
        description: `${vehicles.length} total de veículos`,
        loading: vehiclesLoading,
      },
      {
        title: "Alertas de Manutenção",
        value: maintenanceAlerts.toString(),
        icon: AlertTriangle,
        iconColor: "text-red-500",
        description: "Manutenções próximas do vencimento",
        loading: vehiclesLoading,
      },
    ]
  }, [employees, equipment, vehicles, employeesLoading, equipmentLoading, vehiclesLoading])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border shadow-lg bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className="p-2 rounded-full bg-muted/50">
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.loading ? (
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.loading ? (
                <div className="animate-pulse bg-muted h-3 w-24 rounded"></div>
              ) : (
                stat.description
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
