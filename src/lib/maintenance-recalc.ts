"use client";

import { VehicleScheduledMaintenance } from "@/lib/supabase";

export interface MaintenanceRecalcOptions {
  vehicleId: string;
  currentKm: number;
  performedMaintenanceTypes?: string[]; // Tipos de manutenção realizados
  recalcAll?: boolean; // Se deve recalcular todas ou apenas as realizadas
}

export interface RecalcResult {
  updatedMaintenances: VehicleScheduledMaintenance[];
  skippedMaintenances: VehicleScheduledMaintenance[];
  newMaintenances: VehicleScheduledMaintenance[];
}

/**
 * Recalcula manutenções programadas após uma manutenção ser realizada
 */
export function calculateMaintenanceRecalc(
  scheduledMaintenances: VehicleScheduledMaintenance[],
  options: MaintenanceRecalcOptions
): RecalcResult {
  const { currentKm, performedMaintenanceTypes = [], recalcAll = false } = options;
  
  const updatedMaintenances: VehicleScheduledMaintenance[] = [];
  const skippedMaintenances: VehicleScheduledMaintenance[] = [];
  const newMaintenances: VehicleScheduledMaintenance[] = [];

  for (const maintenance of scheduledMaintenances) {
    if (!maintenance.is_active) {
      skippedMaintenances.push(maintenance);
      continue;
    }

    // Verificar se deve recalcular esta manutenção
    const shouldRecalc = recalcAll || 
      performedMaintenanceTypes.includes(maintenance.maintenance_type);

    if (shouldRecalc) {
      // Recalcular próxima manutenção: KM atual + intervalo
      const nextMaintenanceKm = currentKm + maintenance.interval_km;
      
      updatedMaintenances.push({
        ...maintenance,
        next_maintenance_km: nextMaintenanceKm,
        updated_at: new Date().toISOString()
      });
    } else {
      skippedMaintenances.push(maintenance);
    }
  }

  return {
    updatedMaintenances,
    skippedMaintenances,
    newMaintenances
  };
}

/**
 * Verifica se uma manutenção está próxima do vencimento
 */
export function isMaintenanceDue(
  maintenance: VehicleScheduledMaintenance,
  currentKm: number,
  alertKm: number = 1000
): boolean {
  const kmRemaining = maintenance.next_maintenance_km - currentKm;
  return kmRemaining <= alertKm;
}

/**
 * Verifica se uma manutenção está vencida
 */
export function isMaintenanceOverdue(
  maintenance: VehicleScheduledMaintenance,
  currentKm: number
): boolean {
  return maintenance.next_maintenance_km <= currentKm;
}

/**
 * Calcula o status de uma manutenção programada
 */
export function getMaintenanceStatus(
  maintenance: VehicleScheduledMaintenance,
  currentKm: number,
  alertKm: number = 1000
): 'ok' | 'warning' | 'overdue' {
  if (isMaintenanceOverdue(maintenance, currentKm)) {
    return 'overdue';
  }
  
  if (isMaintenanceDue(maintenance, currentKm, alertKm)) {
    return 'warning';
  }
  
  return 'ok';
}

/**
 * Gera sugestões de recálculo baseadas na manutenção realizada
 */
export function generateRecalcSuggestions(
  scheduledMaintenances: VehicleScheduledMaintenance[],
  performedMaintenanceType: string,
  currentKm: number
): {
  suggested: VehicleScheduledMaintenance[];
  related: VehicleScheduledMaintenance[];
} {
  const suggested: VehicleScheduledMaintenance[] = [];
  const related: VehicleScheduledMaintenance[] = [];

  // Mapear manutenções relacionadas
  const relatedMaintenances: Record<string, string[]> = {
    'oleo': ['filtros', 'revisao'],
    'filtros': ['oleo', 'revisao'],
    'revisao': ['oleo', 'filtros', 'freios'],
    'freios': ['revisao'],
    'pneus': ['revisao'],
    'correia': ['revisao']
  };

  const relatedTypes = relatedMaintenances[performedMaintenanceType] || [];

  for (const maintenance of scheduledMaintenances) {
    if (!maintenance.is_active) continue;

    if (maintenance.maintenance_type === performedMaintenanceType) {
      suggested.push(maintenance);
    } else if (relatedTypes.includes(maintenance.maintenance_type)) {
      related.push(maintenance);
    }
  }

  return { suggested, related };
}
