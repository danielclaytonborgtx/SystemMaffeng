"use client"

import { useVehicleMaintenanceInfo } from "@/hooks"
import { Vehicle } from "@/lib/supabase"

interface MaintenanceInfoDisplayProps {
  vehicle?: Vehicle | null
  showType?: boolean
  showRemaining?: boolean
  className?: string
}

export function MaintenanceInfoDisplay({ 
  vehicle, 
  showType = true, 
  showRemaining = true, 
  className = "" 
}: MaintenanceInfoDisplayProps) {
  const maintenanceInfo = useVehicleMaintenanceInfo(vehicle)

  if (!maintenanceInfo.nextMaintenanceKm) {
    return (
      <div className={className}>
        <span className="text-muted-foreground">Não agendada</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={`font-bold ${
        maintenanceInfo.isOverdue ? "text-red-600" : ""
      }`}>
        {maintenanceInfo.nextMaintenanceKm.toLocaleString('pt-BR')} km
      </div>
      
      {showType && maintenanceInfo.nextMaintenanceType && (
        <div className="text-xs text-gray-500 mt-1">
          {maintenanceInfo.nextMaintenanceType}
        </div>
      )}
      
      {showRemaining && maintenanceInfo.kmRemaining !== null && (
        <div className={`text-xs mt-1 ${
          maintenanceInfo.isOverdue 
            ? "text-red-500 font-medium" 
            : maintenanceInfo.kmRemaining <= 1000 
              ? "text-yellow-600 font-medium" 
              : "text-gray-500"
        }`}>
          {maintenanceInfo.isOverdue 
            ? `Vencida há ${Math.abs(maintenanceInfo.kmRemaining).toLocaleString('pt-BR')} km`
            : `Faltam ${maintenanceInfo.kmRemaining.toLocaleString('pt-BR')} km`
          }
        </div>
      )}
    </div>
  )
}
