import { useMemo } from 'react'
import { useEmployees, useEquipment, useVehicles } from '@/hooks'

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  category: 'manutenção' | 'documentação' | 'equipamento' | 'colaborador'
  title: string
  description: string
  time: string
  entity?: string
  daysOverdue?: number
  vehiclePlate?: string
  vehicleModel?: string
}

export function useAlerts() {
  const { data: employees } = useEmployees()
  const { data: equipment } = useEquipment()
  const { data: vehicles } = useVehicles()

  const alerts = useMemo(() => {
    const alertsList: Alert[] = []
    const today = new Date()
    
    // Alertas de manutenção vencida
    vehicles.forEach(vehicle => {
      if (vehicle.nextMaintenance && vehicle.currentKm && vehicle.maintenanceKm) {
        const nextMaintenanceDate = vehicle.nextMaintenance.toDate()
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilMaintenance < 0) {
          alertsList.push({
            id: `maintenance-overdue-${vehicle.id}`,
            type: "critical",
            category: "manutenção",
            title: `Manutenção Vencida - ${vehicle.plate}`,
            description: `${vehicle.model} - Manutenção vencida há ${Math.abs(daysUntilMaintenance)} dias`,
            time: "Urgente",
            entity: vehicle.id,
            daysOverdue: Math.abs(daysUntilMaintenance),
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
          })
        } else if (daysUntilMaintenance <= 7) {
          alertsList.push({
            id: `maintenance-due-${vehicle.id}`,
            type: "warning",
            category: "manutenção",
            title: `Manutenção Próxima - ${vehicle.plate}`,
            description: `${vehicle.model} - Revisão em ${daysUntilMaintenance} dias`,
            time: "Atenção",
            entity: vehicle.id,
            daysOverdue: -daysUntilMaintenance,
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
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
            type: "critical",
            category: "documentação",
            title: `Seguro Vencido - ${vehicle.plate}`,
            description: `${vehicle.model} - Seguro vencido há ${Math.abs(daysUntilInsurance)} dias`,
            time: "Urgente",
            entity: vehicle.id,
            daysOverdue: Math.abs(daysUntilInsurance),
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
          })
        } else if (daysUntilInsurance <= 30) {
          alertsList.push({
            id: `insurance-due-${vehicle.id}`,
            type: "warning",
            category: "documentação",
            title: `Seguro Próximo - ${vehicle.plate}`,
            description: `${vehicle.model} - Seguro vence em ${daysUntilInsurance} dias`,
            time: "Atenção",
            entity: vehicle.id,
            daysOverdue: -daysUntilInsurance,
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
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
            type: "critical",
            category: "documentação",
            title: `Licenciamento Vencido - ${vehicle.plate}`,
            description: `${vehicle.model} - Licenciamento vencido há ${Math.abs(daysUntilLicense)} dias`,
            time: "Urgente",
            entity: vehicle.id,
            daysOverdue: Math.abs(daysUntilLicense),
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
          })
        } else if (daysUntilLicense <= 30) {
          alertsList.push({
            id: `license-due-${vehicle.id}`,
            type: "warning",
            category: "documentação",
            title: `Licenciamento Próximo - ${vehicle.plate}`,
            description: `${vehicle.model} - Licenciamento vence em ${daysUntilLicense} dias`,
            time: "Atenção",
            entity: vehicle.id,
            daysOverdue: -daysUntilLicense,
            vehiclePlate: vehicle.plate,
            vehicleModel: vehicle.model,
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
        time: "Info",
      })
    }
    
    // Ordenar alertas por prioridade (critical primeiro, depois warning, depois info)
    const sortedAlerts = alertsList.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 }
      return priority[a.type] - priority[b.type]
    })
    
    return sortedAlerts
  }, [employees, equipment, vehicles])

  const criticalAlerts = useMemo(() => 
    alerts.filter(alert => alert.type === 'critical'), 
    [alerts]
  )

  const warningAlerts = useMemo(() => 
    alerts.filter(alert => alert.type === 'warning'), 
    [alerts]
  )

  const infoAlerts = useMemo(() => 
    alerts.filter(alert => alert.type === 'info'), 
    [alerts]
  )

  const alertsByCategory = useMemo(() => {
    const categories = {
      manutenção: alerts.filter(a => a.category === 'manutenção'),
      documentação: alerts.filter(a => a.category === 'documentação'),
      equipamento: alerts.filter(a => a.category === 'equipamento'),
      colaborador: alerts.filter(a => a.category === 'colaborador'),
    }
    return categories
  }, [alerts])

  return {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    alertsByCategory,
    totalAlerts: alerts.length,
    criticalCount: criticalAlerts.length,
    warningCount: warningAlerts.length,
    infoCount: infoAlerts.length,
  }
}

