"use client";

import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { useState, useEffect } from "react";

// Interface para notificações em tempo real
interface RealtimeNotification {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  entityType: string;
  entityId: string;
}

// Armazenar notificações em memória (pode ser persistido no localStorage depois)
let notifications: RealtimeNotification[] = [];
let notificationListeners: ((notifications: RealtimeNotification[]) => void)[] =
  [];

// Função para adicionar notificação
export const addNotification = (
  notification: Omit<RealtimeNotification, "id" | "timestamp">
) => {
  const newNotification: RealtimeNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };

  notifications.unshift(newNotification); // Adicionar no início
  notifications = notifications.slice(0, 50); // Manter apenas as 50 mais recentes

  // Notificar todos os listeners
  notificationListeners.forEach((listener) => listener([...notifications]));

  console.log("🔔 Nova notificação:", newNotification);
};

// Função para limpar notificação
export const clearNotification = (id: string) => {
  notifications = notifications.filter((n) => n.id !== id);
  notificationListeners.forEach((listener) => listener([...notifications]));
};

// Função para limpar todas as notificações
export const clearAllNotifications = () => {
  notifications = [];
  notificationListeners.forEach((listener) => listener([]));
};

// Hook para escutar notificações
export const useRealtimeNotifications = () => {
  const [notificationsList, setNotificationsList] =
    useState<RealtimeNotification[]>(notifications);

  useEffect(() => {
    // Adicionar listener
    const listener = (newNotifications: RealtimeNotification[]) => {
      setNotificationsList(newNotifications);
    };

    notificationListeners.push(listener);

    // Cleanup
    return () => {
      notificationListeners = notificationListeners.filter(
        (l) => l !== listener
      );
    };
  }, []);

  return notificationsList;
};

// Função para processar mudanças do WebSocket e gerar notificações
export const processRealtimeChange = (
  eventType: "INSERT" | "UPDATE" | "DELETE",
  table: string,
  payload: any,
  queryClient: QueryClient
) => {
  console.log(`🔔 Processando mudança: ${eventType} em ${table}`, payload);

  switch (table) {
    case "employees":
      processEmployeeChange(eventType, payload);
      break;
    case "equipment":
      processEquipmentChange(eventType, payload);
      break;
    case "vehicles":
      processVehicleChange(eventType, payload);
      break;
    case "equipment_movements":
      processMovementChange(eventType, payload);
      break;
    case "vehicle_maintenances":
      processMaintenanceChange(eventType, payload);
      break;
    case "vehicle_fuels":
      processFuelChange(eventType, payload);
      break;
    case "vehicle_scheduled_maintenances":
      processScheduledMaintenanceChange(eventType, payload);
      break;
  }
};

// Processar mudanças em colaboradores
const processEmployeeChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "info",
        title: "Novo Colaborador",
        message: `${payload.new.name} foi adicionado ao sistema`,
        entityType: "employee",
        entityId: payload.new.id,
      });
      break;
    case "UPDATE":
      addNotification({
        type: "info",
        title: "Colaborador Atualizado",
        message: `${payload.new.name} foi atualizado`,
        entityType: "employee",
        entityId: payload.new.id,
      });
      break;
    case "DELETE":
      addNotification({
        type: "warning",
        title: "Colaborador Removido",
        message: `${payload.old.name} foi removido do sistema`,
        entityType: "employee",
        entityId: payload.old.id,
      });
      break;
  }
};

// Processar mudanças em equipamentos
const processEquipmentChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "info",
        title: "Novo Equipamento",
        message: `${payload.new.name} foi adicionado ao almoxarifado`,
        entityType: "equipment",
        entityId: payload.new.id,
      });
      break;
    case "UPDATE":
      if (payload.new.status === "maintenance") {
        addNotification({
          type: "warning",
          title: "Equipamento em Manutenção",
          message: `${payload.new.name} foi enviado para manutenção`,
          entityType: "equipment",
          entityId: payload.new.id,
        });
      } else if (payload.new.status === "available") {
        addNotification({
          type: "info",
          title: "Equipamento Disponível",
          message: `${payload.new.name} está disponível no almoxarifado`,
          entityType: "equipment",
          entityId: payload.new.id,
        });
      }
      break;
  }
};

// Processar mudanças em veículos
const processVehicleChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "info",
        title: "Novo Veículo",
        message: `${payload.new.plate} - ${payload.new.model} foi adicionado à frota`,
        entityType: "vehicle",
        entityId: payload.new.id,
      });
      break;
    case "UPDATE":
      // Verificar se é uma mudança de status importante
      if (payload.new.status !== payload.old.status) {
        addNotification({
          type: payload.new.status === "maintenance" ? "warning" : "info",
          title: "Status do Veículo Alterado",
          message: `${payload.new.plate} agora está ${payload.new.status}`,
          entityType: "vehicle",
          entityId: payload.new.id,
        });
      }
      break;
  }
};

// Processar movimentações de equipamentos
const processMovementChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      const movementType =
        payload.new.type === "out" ? "Retirada" : "Devolução";
      addNotification({
        type: "info",
        title: `${movementType} de Equipamento`,
        message: `${
          payload.new.equipment_name
        } foi ${movementType.toLowerCase()} por ${payload.new.employee_name}`,
        entityType: "movement",
        entityId: payload.new.id,
      });
      break;
  }
};

// Processar manutenções de veículos
const processMaintenanceChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "warning",
        title: "Manutenção Registrada",
        message: `${payload.new.vehicle_plate} - ${
          payload.new.type || "Manutenção"
        } realizada`,
        entityType: "maintenance",
        entityId: payload.new.id,
      });
      break;
  }
};

// Processar abastecimentos
const processFuelChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "info",
        title: "Abastecimento Registrado",
        message: `${payload.new.vehicle_plate} - ${payload.new.liters}L abastecidos`,
        entityType: "fuel",
        entityId: payload.new.id,
      });
      break;
  }
};

// Processar manutenções programadas
const processScheduledMaintenanceChange = (eventType: string, payload: any) => {
  switch (eventType) {
    case "INSERT":
      addNotification({
        type: "warning",
        title: "Manutenção Programada",
        message: `${payload.new.vehicle_plate} - Nova manutenção programada`,
        entityType: "scheduled_maintenance",
        entityId: payload.new.id,
      });
      break;
    case "UPDATE":
      if (payload.new.is_active !== payload.old.is_active) {
        addNotification({
          type: payload.new.is_active ? "warning" : "info",
          title: "Manutenção Programada Atualizada",
          message: `${payload.new.vehicle_plate} - Manutenção ${
            payload.new.is_active ? "ativada" : "desativada"
          }`,
          entityType: "scheduled_maintenance",
          entityId: payload.new.id,
        });
      }
      break;
  }
};

// Função para obter contadores de notificações
export const getNotificationCounts = () => {
  const urgent = notifications.filter((n) => n.type === "urgent").length;
  const warning = notifications.filter((n) => n.type === "warning").length;
  const info = notifications.filter((n) => n.type === "info").length;

  return {
    urgent,
    warning,
    info,
    total: notifications.length,
  };
};

// Função para limpar notificações antigas (mais de 24h)
export const cleanupOldNotifications = () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const initialLength = notifications.length;

  notifications = notifications.filter((n) => n.timestamp > oneDayAgo);

  if (notifications.length !== initialLength) {
    notificationListeners.forEach((listener) => listener([...notifications]));
    console.log(
      `🧹 Limpas ${initialLength - notifications.length} notificações antigas`
    );
  }
};
