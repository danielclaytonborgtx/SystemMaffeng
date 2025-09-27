"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  Wrench,
  Shield,
  FileText,
  Bell,
  ArrowRight,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVehicles, useVehicleScheduledMaintenances } from "@/hooks";
import {
  useRealtimeNotifications,
  clearNotification,
  clearAllNotifications,
  getNotificationCounts,
} from "@/lib/notifications-realtime";
import { useRouter } from "next/navigation";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: vehicles } = useVehicles();
  const { data: scheduledMaintenances } = useVehicleScheduledMaintenances();

  // Notificações em tempo real
  const realtimeNotifications = useRealtimeNotifications();
  const notificationCounts = getNotificationCounts();

  const router = useRouter();

  // Combinar notificações em tempo real com alertas estáticos
  const allNotifications = useMemo(() => {
    const notificationsList: any[] = [];
    const today = new Date();

    // Adicionar notificações em tempo real
    realtimeNotifications.forEach((notif) => {
      notificationsList.push({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        description: notif.message,
        time: notif.timestamp,
        isRealtime: true,
      });
    });

    console.log(
      "NotificationsDropdown: Processando notificações para veículos:",
      vehicles.length
    );

    // Notificações de manutenção por quilometragem e data
    vehicles.forEach((vehicle) => {
      if (vehicle.current_km && vehicle.maintenance_km) {
        const kmUntilMaintenance = vehicle.maintenance_km - vehicle.current_km;

        // Notificação por quilometragem (1000km antes da manutenção)
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          notificationsList.push({
            id: `maintenance-km-${vehicle.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Próxima por KM",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Faltam ${kmUntilMaintenance} km para manutenção`,
            time: "Agora",
          });
        } else if (kmUntilMaintenance <= 0) {
          notificationsList.push({
            id: `maintenance-overdue-km-${vehicle.id}`,
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Vencida por KM",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Manutenção vencida há ${Math.abs(kmUntilMaintenance)} km`,
            time: "Urgente",
          });
        }
      }

      // Notificação por data (se existir next_maintenance)
      if (vehicle.next_maintenance) {
        const nextMaintenanceDate = new Date(vehicle.next_maintenance);
        const daysUntilMaintenance = Math.ceil(
          (nextMaintenanceDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntilMaintenance < 0) {
          notificationsList.push({
            id: `maintenance-overdue-date-${vehicle.id}`,
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Vencida por Data",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Manutenção vencida há ${Math.abs(
              daysUntilMaintenance
            )} dias`,
            time: "Urgente",
          });
        } else if (daysUntilMaintenance <= 7) {
          notificationsList.push({
            id: `maintenance-due-date-${vehicle.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Próxima por Data",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Revisão em ${daysUntilMaintenance} dias`,
            time: "Atenção",
          });
        }
      }
    });

    // Notificações de seguro vencido
    vehicles.forEach((vehicle) => {
      if (vehicle.insurance_expiry) {
        const insuranceDate = new Date(vehicle.insurance_expiry);
        const daysUntilInsurance = Math.ceil(
          (insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilInsurance < 0) {
          notificationsList.push({
            id: `insurance-overdue-${vehicle.id}`,
            type: "urgent",
            icon: Shield,
            title: "Seguro Vencido",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Seguro vencido há ${Math.abs(daysUntilInsurance)} dias`,
            time: "Urgente",
          });
        } else if (daysUntilInsurance <= 30) {
          notificationsList.push({
            id: `insurance-due-${vehicle.id}`,
            type: "warning",
            icon: Shield,
            title: "Seguro Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Seguro vence em ${daysUntilInsurance} dias`,
            time: "Atenção",
          });
        }
      }
    });

    // Notificações de licenciamento próximo
    vehicles.forEach((vehicle) => {
      if (vehicle.license_expiry) {
        const licenseDate = new Date(vehicle.license_expiry);
        const daysUntilLicense = Math.ceil(
          (licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilLicense < 0) {
          notificationsList.push({
            id: `license-overdue-${vehicle.id}`,
            type: "urgent",
            icon: FileText,
            title: "Licenciamento Vencido",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Licenciamento vencido há ${Math.abs(
              daysUntilLicense
            )} dias`,
            time: "Urgente",
          });
        } else if (daysUntilLicense <= 30) {
          notificationsList.push({
            id: `license-due-${vehicle.id}`,
            type: "warning",
            icon: FileText,
            title: "Licenciamento Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Licenciamento vence em ${daysUntilLicense} dias`,
            time: "Atenção",
          });
        }
      }
    });

    // Notificações de manutenções programadas vencidas
    vehicles.forEach((vehicle) => {
      const vehicleScheduledMaintenances = scheduledMaintenances.filter(
        (sm) => String(sm.vehicle_id) === String(vehicle.id) && sm.is_active
      );

      vehicleScheduledMaintenances.forEach((scheduledMaintenance) => {
        const currentKm = vehicle.current_km || 0;
        const kmUntilMaintenance =
          scheduledMaintenance.next_maintenance_km - currentKm;

        // Notificação por quilometragem das manutenções programadas
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          notificationsList.push({
            id: `scheduled-maintenance-km-${scheduledMaintenance.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Programada Próxima",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `${scheduledMaintenance.maintenance_name} em ${kmUntilMaintenance} km`,
            time: "Atenção",
          });
        } else if (kmUntilMaintenance <= 0) {
          notificationsList.push({
            id: `scheduled-maintenance-overdue-km-${scheduledMaintenance.id}`,
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Programada Vencida",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `${
              scheduledMaintenance.maintenance_name
            } vencida há ${Math.abs(kmUntilMaintenance)} km`,
            time: "Urgente",
          });
        }
      });
    });

    // Ordenar notificações por prioridade (urgent primeiro, depois warning)
    const sortedNotifications = notificationsList.sort((a: any, b: any) => {
      const priority: { [key: string]: number } = { urgent: 0, warning: 1 };
      return priority[a.type] - priority[b.type];
    });

    console.log(
      "NotificationsDropdown: Total de notificações geradas:",
      sortedNotifications.length
    );
    console.log("NotificationsDropdown: Notificações:", sortedNotifications);

    return sortedNotifications.slice(0, 10); // Limitar a 10 notificações
  }, [vehicles, scheduledMaintenances, realtimeNotifications]);

  const urgentCount = allNotifications.filter(
    (n) => n.type === "urgent"
  ).length;
  const warningCount = allNotifications.filter(
    (n) => n.type === "warning"
  ).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer relative"
        >
          <Bell className="h-5 w-5" />
          {(urgentCount > 0 || warningCount > 0) && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
              {urgentCount + warningCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[95vw] max-w-96 p-0 mx-2 sm:mx-0"
        sideOffset={12}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 px-3 sm:px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                Notificações
                {(urgentCount > 0 || warningCount > 0) && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {urgentCount + warningCount}
                  </Badge>
                )}
              </CardTitle>
              {allNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAllNotifications()}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 sm:h-80">
              {allNotifications.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-muted-foreground">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-b last:border-b-0"
                    >
                      <div
                        className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                          notification.type === "urgent"
                            ? "bg-red-500/20"
                            : "bg-yellow-500/20"
                        }`}
                      >
                        <notification.icon
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            notification.type === "urgent"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 mb-1">
                          <p className="font-medium text-xs sm:text-sm break-words leading-tight">
                            {notification.title}
                          </p>
                          <div className="flex gap-1">
                            <Badge
                              className={`flex-shrink-0 w-fit text-xs ${
                                notification.type === "urgent"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }`}
                            >
                              {notification.type === "urgent"
                                ? "Urgente"
                                : "Atenção"}
                            </Badge>
                            {notification.isRealtime && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800"
                              >
                                Tempo Real
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words leading-tight mb-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground break-words leading-tight">
                          {notification.detail}
                        </p>
                      </div>
                      {notification.isRealtime && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {allNotifications.length > 0 && (
              <div className="px-2 sm:px-3 pt-2 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    router.push("/dashboard/alertas");
                    setIsOpen(false);
                  }}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 mb-0 text-xs sm:text-sm"
                >
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Ver Todos os Alertas</span>
                  <span className="sm:hidden">Ver Alertas</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
