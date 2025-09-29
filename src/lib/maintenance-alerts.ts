"use client";

import { VehicleScheduledMaintenance } from "@/lib/supabase";

export interface AlertConfig {
  id: string;
  name: string;
  kmBefore: number; // Quantos km antes de avisar
  isEnabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notificationTypes: ('dashboard' | 'email' | 'push')[];
}

export interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  maintenanceId: string;
  maintenanceName: string;
  currentKm: number;
  nextMaintenanceKm: number;
  kmRemaining: number;
  alertType: 'upcoming' | 'due' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  isRead: boolean;
  isDismissed: boolean;
}

export const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
  {
    id: 'early_warning',
    name: 'Aviso Antecipado',
    kmBefore: 2000,
    isEnabled: true,
    priority: 'low',
    notificationTypes: ['dashboard']
  },
  {
    id: 'approaching',
    name: 'Próximo do Vencimento',
    kmBefore: 1000,
    isEnabled: true,
    priority: 'medium',
    notificationTypes: ['dashboard', 'push']
  },
  {
    id: 'due_soon',
    name: 'Vencimento Próximo',
    kmBefore: 500,
    isEnabled: true,
    priority: 'high',
    notificationTypes: ['dashboard', 'push', 'email']
  },
  {
    id: 'overdue',
    name: 'Vencida',
    kmBefore: 0,
    isEnabled: true,
    priority: 'critical',
    notificationTypes: ['dashboard', 'push', 'email']
  }
];

/**
 * Gera alertas para manutenções programadas
 */
export function generateMaintenanceAlerts(
  scheduledMaintenances: VehicleScheduledMaintenance[],
  vehicleId: string,
  currentKm: number,
  alertConfigs: AlertConfig[] = DEFAULT_ALERT_CONFIGS
): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];

  for (const maintenance of scheduledMaintenances) {
    if (!maintenance.is_active) continue;

    const kmRemaining = maintenance.next_maintenance_km - currentKm;
    
    // Verificar cada configuração de alerta
    for (const config of alertConfigs) {
      if (!config.isEnabled) continue;

      const shouldAlert = kmRemaining <= config.kmBefore;
      
      if (shouldAlert) {
        const alertType = kmRemaining <= 0 ? 'overdue' : 
                         kmRemaining <= 500 ? 'due' : 'upcoming';
        
        const message = generateAlertMessage(
          maintenance.maintenance_name,
          kmRemaining,
          alertType
        );

        alerts.push({
          id: `${maintenance.id}-${config.id}`,
          vehicleId,
          maintenanceId: maintenance.id,
          maintenanceName: maintenance.maintenance_name,
          currentKm,
          nextMaintenanceKm: maintenance.next_maintenance_km,
          kmRemaining,
          alertType,
          priority: config.priority,
          message,
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        });
      }
    }
  }

  // Ordenar por prioridade e data
  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * Gera mensagem personalizada para o alerta
 */
function generateAlertMessage(
  maintenanceName: string,
  kmRemaining: number,
  alertType: 'upcoming' | 'due' | 'overdue'
): string {
  const absKm = Math.abs(kmRemaining);
  
  switch (alertType) {
    case 'overdue':
      return `🚨 ${maintenanceName} está VENCIDA há ${absKm.toLocaleString('pt-BR')} km! Realize urgentemente.`;
    
    case 'due':
      return `⚠️ ${maintenanceName} vence em ${absKm.toLocaleString('pt-BR')} km. Agende para breve.`;
    
    case 'upcoming':
      return `📅 ${maintenanceName} está próxima (faltam ${absKm.toLocaleString('pt-BR')} km). Prepare-se.`;
    
    default:
      return `${maintenanceName}: ${absKm.toLocaleString('pt-BR')} km restantes.`;
  }
}

/**
 * Filtra alertas por prioridade
 */
export function filterAlertsByPriority(
  alerts: MaintenanceAlert[],
  priority: 'low' | 'medium' | 'high' | 'critical'
): MaintenanceAlert[] {
  return alerts.filter(alert => alert.priority === priority);
}

/**
 * Filtra alertas não lidos
 */
export function getUnreadAlerts(alerts: MaintenanceAlert[]): MaintenanceAlert[] {
  return alerts.filter(alert => !alert.isRead);
}

/**
 * Filtra alertas críticos (vencidos)
 */
export function getCriticalAlerts(alerts: MaintenanceAlert[]): MaintenanceAlert[] {
  return alerts.filter(alert => alert.alertType === 'overdue');
}

/**
 * Agrupa alertas por veículo
 */
export function groupAlertsByVehicle(alerts: MaintenanceAlert[]): Record<string, MaintenanceAlert[]> {
  return alerts.reduce((groups, alert) => {
    if (!groups[alert.vehicleId]) {
      groups[alert.vehicleId] = [];
    }
    groups[alert.vehicleId].push(alert);
    return groups;
  }, {} as Record<string, MaintenanceAlert[]>);
}

/**
 * Calcula estatísticas de alertas
 */
export function calculateAlertStats(alerts: MaintenanceAlert[]) {
  return {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
    medium: alerts.filter(a => a.priority === 'medium').length,
    low: alerts.filter(a => a.priority === 'low').length,
    overdue: alerts.filter(a => a.alertType === 'overdue').length,
    due: alerts.filter(a => a.alertType === 'due').length,
    upcoming: alerts.filter(a => a.alertType === 'upcoming').length
  };
}
