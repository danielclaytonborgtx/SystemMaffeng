"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Calendar,
  RefreshCw,
  Trash2
} from "lucide-react";
import { VehicleScheduledMaintenance } from "@/lib/supabase";
import { getMaintenanceStatus, isMaintenanceOverdue, isMaintenanceDue } from "@/lib/maintenance-recalc";

interface MaintenanceStatusDashboardProps {
  vehicleId: string;
  currentKm: number;
  scheduledMaintenances: VehicleScheduledMaintenance[];
  onRecalculate?: (maintenanceType: string) => void;
  onPause?: (maintenance: VehicleScheduledMaintenance) => void;
  onDelete?: (maintenance: VehicleScheduledMaintenance) => void;
}

export function MaintenanceStatusDashboard({
  vehicleId,
  currentKm,
  scheduledMaintenances,
  onRecalculate,
  onPause,
  onDelete
}: MaintenanceStatusDashboardProps) {
  // Filtrar apenas manutenções ativas
  const activeMaintenances = scheduledMaintenances.filter(m => m.is_active);
  
  // Calcular estatísticas
  const stats = {
    total: activeMaintenances.length,
    overdue: activeMaintenances.filter(m => isMaintenanceOverdue(m, currentKm)).length,
    warning: activeMaintenances.filter(m => isMaintenanceDue(m, currentKm, 1000) && !isMaintenanceOverdue(m, currentKm)).length,
    ok: activeMaintenances.filter(m => getMaintenanceStatus(m, currentKm) === 'ok').length
  };

  const getStatusIcon = (maintenance: VehicleScheduledMaintenance) => {
    const status = getMaintenanceStatus(maintenance, currentKm);
    
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (maintenance: VehicleScheduledMaintenance) => {
    const status = getMaintenanceStatus(maintenance, currentKm);
    const kmRemaining = maintenance.next_maintenance_km - currentKm;
    
    switch (status) {
      case 'overdue':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Vencida há {Math.abs(kmRemaining).toLocaleString('pt-BR')} km
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Faltam {Math.max(0, kmRemaining).toLocaleString('pt-BR')} km
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Faltam {Math.max(0, kmRemaining).toLocaleString('pt-BR')} km
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Lista de Manutenções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status das Manutenções Programadas</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecalculate?.('all')}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recalcular Todas</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeMaintenances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma manutenção programada ativa</p>
              <p className="text-sm">Configure manutenções programadas para este veículo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMaintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    getMaintenanceStatus(maintenance, currentKm) === 'overdue'
                      ? 'border-red-200 bg-red-50'
                      : getMaintenanceStatus(maintenance, currentKm) === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(maintenance)}
                    <div>
                      <h4 className="font-medium text-sm">{maintenance.maintenance_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Intervalo: {maintenance.interval_km.toLocaleString('pt-BR')} km
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {maintenance.next_maintenance_km.toLocaleString('pt-BR')} km
                      </p>
                      {getStatusBadge(maintenance)}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRecalculate?.(maintenance.maintenance_type)}
                        className="h-8 w-8 p-0"
                        title="Recalcular manutenção"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(maintenance)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir manutenção"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
