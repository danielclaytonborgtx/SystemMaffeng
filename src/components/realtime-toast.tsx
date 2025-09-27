"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRealtimeNotifications } from "@/lib/notifications-realtime";
import { AlertTriangle, Clock, Bell, CheckCircle } from "lucide-react";

// Componente para mostrar notificações toast em tempo real
export function RealtimeToast() {
  const notifications = useRealtimeNotifications();

  useEffect(() => {
    // Mostrar toast apenas para notificações muito recentes (últimos 5 segundos)
    const recentNotifications = notifications.filter(
      (notif) => Date.now() - notif.timestamp.getTime() < 5000
    );

    recentNotifications.forEach((notification) => {
      const getToastIcon = () => {
        switch (notification.type) {
          case "urgent":
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
          case "warning":
            return <Clock className="h-4 w-4 text-yellow-500" />;
          case "info":
            return <Bell className="h-4 w-4 text-blue-500" />;
          default:
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
      };

      const getToastAction = () => {
        switch (notification.type) {
          case "urgent":
            return {
              label: "Ver Alertas",
              onClick: () => {
                // Navegar para página de alertas
                window.location.href = "/dashboard/alertas";
              },
            };
          case "warning":
            return {
              label: "Ver Detalhes",
              onClick: () => {
                // Navegar para página relevante baseada no tipo de entidade
                switch (notification.entityType) {
                  case "vehicle":
                    window.location.href = "/dashboard/veiculos";
                    break;
                  case "equipment":
                    window.location.href = "/dashboard/equipamentos";
                    break;
                  default:
                    window.location.href = "/dashboard/alertas";
                }
              },
            };
          default:
            return undefined;
        }
      };

      toast(notification.title, {
        description: notification.message,
        icon: getToastIcon(),
        action: getToastAction(),
        duration: notification.type === "urgent" ? 10000 : 5000, // Urgentas ficam mais tempo
        className:
          notification.type === "urgent"
            ? "border-red-200 bg-red-50"
            : notification.type === "warning"
            ? "border-yellow-200 bg-yellow-50"
            : "border-blue-200 bg-blue-50",
      });
    });
  }, [notifications]);

  return null; // Este componente não renderiza nada visual
}

// Hook para mostrar notificação manual
export const useRealtimeToast = () => {
  const showToast = (notification: {
    type: "urgent" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    const getToastIcon = () => {
      switch (notification.type) {
        case "urgent":
          return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case "warning":
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case "info":
          return <Bell className="h-4 w-4 text-blue-500" />;
        default:
          return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
    };

    toast(notification.title, {
      description: notification.message,
      icon: getToastIcon(),
      duration: notification.type === "urgent" ? 10000 : 5000,
      className:
        notification.type === "urgent"
          ? "border-red-200 bg-red-50"
          : notification.type === "warning"
          ? "border-yellow-200 bg-yellow-50"
          : "border-blue-200 bg-blue-50",
    });
  };

  return { showToast };
};
