"use client"

import { useMemo } from 'react'
import { useVehicleScheduledMaintenances } from './use-supabase'
import { Vehicle } from '@/lib/supabase'

interface MaintenanceInfo {
  nextMaintenanceKm: number | null
  nextMaintenanceType: string | null
  isOverdue: boolean
  kmRemaining: number | null
  scheduledMaintenances: Array<{
    type: string
    name: string
    nextKm: number
    isOverdue: boolean
    kmRemaining: number
  }>
}

export function useVehicleMaintenanceInfo(vehicle?: Vehicle | null): MaintenanceInfo {
  const { data: scheduledMaintenances, loading } = useVehicleScheduledMaintenances(vehicle?.id)

  return useMemo(() => {
    if (!vehicle || loading) {
      return {
        nextMaintenanceKm: null,
        nextMaintenanceType: null,
        isOverdue: false,
        kmRemaining: null,
        scheduledMaintenances: []
      }
    }

    const currentKm = vehicle.current_km || 0
    const vehicleMaintenanceKm = vehicle.maintenance_km

    // Processar manutenções programadas ativas
    const activeScheduledMaintenances = scheduledMaintenances
      .filter(sm => sm.is_active)
      .map(sm => ({
        type: sm.maintenance_type,
        name: sm.maintenance_name,
        nextKm: sm.next_maintenance_km,
        isOverdue: sm.next_maintenance_km <= currentKm,
        kmRemaining: sm.next_maintenance_km - currentKm
      }))
      .sort((a, b) => a.nextKm - b.nextKm) // Ordenar por quilometragem

    // Encontrar a próxima manutenção (seja programada ou manual)
    let nextMaintenanceKm: number | null = null
    let nextMaintenanceType: string | null = null
    let isOverdue = false
    let kmRemaining: number | null = null

    // Verificar se há manutenção programada mais próxima
    if (activeScheduledMaintenances.length > 0) {
      const nextScheduled = activeScheduledMaintenances[0]
      nextMaintenanceKm = nextScheduled.nextKm
      nextMaintenanceType = nextScheduled.name
      isOverdue = nextScheduled.isOverdue
      kmRemaining = nextScheduled.kmRemaining
    }

    // Se não há manutenção programada, usar a manutenção manual do veículo
    if (!nextMaintenanceKm && vehicleMaintenanceKm) {
      nextMaintenanceKm = vehicleMaintenanceKm
      nextMaintenanceType = "Manutenção Manual"
      isOverdue = vehicleMaintenanceKm <= currentKm
      kmRemaining = vehicleMaintenanceKm - currentKm
    }

    return {
      nextMaintenanceKm,
      nextMaintenanceType,
      isOverdue,
      kmRemaining,
      scheduledMaintenances: activeScheduledMaintenances
    }
  }, [vehicle, scheduledMaintenances, loading])
}
