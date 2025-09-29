"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  Settings,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { 
  generateMaintenanceAlerts, 
  calculateAlertStats,
  type MaintenanceAlert,
  type AlertConfig,
  DEFAULT_ALERT_CONFIGS 
} from "@/lib/maintenance-alerts";
import { VehicleScheduledMaintenance } from "@/lib/supabase";

interface MaintenanceAlertsPanelProps {
  vehicleId: string;
  currentKm: number;
  scheduledMaintenances: VehicleScheduledMaintenance[];
  onDismissAlert?: (alertId: string) => void;
  onMarkAsRead?: (alertId: string) => void;
}

export function MaintenanceAlertsPanel({
  vehicleId,
  currentKm,
  scheduledMaintenances,
  onDismissAlert,
  onMarkAsRead
}: MaintenanceAlertsPanelProps) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(DEFAULT_ALERT_CONFIGS);
  const [showSettings, setShowSettings] = useState(false);

  // Gerar alertas quando as manutenções mudam
  useEffect(() => {
    const newAlerts = generateMaintenanceAlerts(
      scheduledMaintenances,
      vehicleId,
      currentKm,
      alertConfigs
    );
    setAlerts(newAlerts);
  }, [scheduledMaintenances, vehicleId, currentKm, alertConfigs]);

  const stats = calculateAlertStats(alerts);
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isDismissed: true } : alert
    ));
    onDismissAlert?.(alertId);
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    onMarkAsRead?.(alertId);
  };

  const handleConfigChange = (configId: string, field: keyof AlertConfig, value: any) => {
    setAlertConfigs(prev => prev.map(config => 
      config.id === configId ? { ...config, [field]: value } : config
    ));
  };

  const getAlertIcon = (alert: MaintenanceAlert) => {
    switch (alert.alertType) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'due':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'secondary',
      medium: 'outline',
      low: 'outline'
    } as const;

    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge 
        variant={variants[priority as keyof typeof variants] || 'outline'}
        className={colors[priority as keyof typeof colors]}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Alertas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Não Lidos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Vencidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Alertas de Manutenção</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showSettings && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-4">Configurações de Alertas</h4>
              <div className="space-y-4">
                {alertConfigs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label className="font-medium">{config.name}</Label>
                        {getPriorityBadge(config.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avisar {config.kmBefore.toLocaleString('pt-BR')} km antes
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`enabled-${config.id}`} className="text-sm">
                          Ativo
                        </Label>
                        <Switch
                          id={`enabled-${config.id}`}
                          checked={config.isEnabled}
                          onCheckedChange={(checked) => 
                            handleConfigChange(config.id, 'isEnabled', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`km-${config.id}`} className="text-sm">
                          KM:
                        </Label>
                        <Input
                          id={`km-${config.id}`}
                          type="number"
                          value={config.kmBefore}
                          onChange={(e) => 
                            handleConfigChange(config.id, 'kmBefore', parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum alerta ativo</p>
              <p className="text-sm">Todas as manutenções estão em dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts
                .filter(alert => !alert.isDismissed)
                .map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    alert.priority === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : alert.priority === 'high'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{alert.maintenanceName}</h4>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Próxima: {alert.nextMaintenanceKm.toLocaleString('pt-BR')} km
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
