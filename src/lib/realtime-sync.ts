"use client";

import { QueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { queryKeys } from "@/lib/query-client";
import { useState, useEffect } from "react";
import { processRealtimeChange } from "@/lib/notifications-realtime";

// Configuração do Supabase para Realtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Interface para configuração de sincronização
interface RealtimeConfig {
  table: string;
  queryKey: string[];
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

// Configurações de sincronização para cada tabela
const REALTIME_CONFIGS: RealtimeConfig[] = [
  {
    table: "employees",
    queryKey: queryKeys.employees,
  },
  {
    table: "equipment",
    queryKey: queryKeys.equipment,
  },
  {
    table: "vehicles",
    queryKey: queryKeys.vehicles,
  },
  {
    table: "equipment_movements",
    queryKey: queryKeys.equipmentMovements,
  },
  {
    table: "vehicle_maintenances",
    queryKey: queryKeys.vehicleMaintenances,
  },
  {
    table: "vehicle_fuels",
    queryKey: queryKeys.vehicleFuels,
  },
  {
    table: "vehicle_scheduled_maintenances",
    queryKey: queryKeys.vehicleScheduledMaintenances,
  },
];

// Função para inicializar sincronização em tempo real
export const initializeRealtimeSync = (queryClient: QueryClient) => {
  console.log("🔄 Inicializando sincronização em tempo real...");

  // Limpar canais existentes antes de criar novos
  stopRealtimeSync();

  REALTIME_CONFIGS.forEach((config) => {
    try {
      // Criar um único canal para todos os eventos da tabela
      const channel = supabase
        .channel(`realtime_${config.table}`, {
          config: {
            broadcast: { self: false },
            presence: { key: "" },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*", // Escutar todos os eventos (INSERT, UPDATE, DELETE)
            schema: "public",
            table: config.table,
          },
          (payload) => {
            console.log(`🔄 ${payload.eventType} em ${config.table}:`, payload);

            // Processar notificação em tempo real
            processRealtimeChange(
              payload.eventType,
              config.table,
              payload,
              queryClient
            );

            // Invalidar cache para forçar refetch
            queryClient.invalidateQueries({
              queryKey: config.queryKey,
            });

            // Atualizar cache local baseado no tipo de evento
            queryClient.setQueryData(config.queryKey, (oldData: any) => {
              if (!Array.isArray(oldData)) return oldData;

              switch (payload.eventType) {
                case "INSERT":
                  return [...oldData, payload.new];
                case "UPDATE":
                  return oldData.map((item: any) =>
                    item.id === payload.new.id ? payload.new : item
                  );
                case "DELETE":
                  return oldData.filter(
                    (item: any) => item.id !== payload.old.id
                  );
                default:
                  return oldData;
              }
            });
          }
        )
        .subscribe((status) => {
          console.log(`📡 Canal ${config.table} status:`, status);
        });

      // Armazenar referência do canal
      activeChannels.push(channel);
    } catch (error) {
      console.warn(`Erro ao configurar canal para ${config.table}:`, error);
    }
  });

  console.log("✅ Sincronização em tempo real configurada!");
};

// Armazenar referências dos canais para cleanup
let activeChannels: any[] = [];

// Função para parar sincronização
export const stopRealtimeSync = () => {
  console.log("🛑 Parando sincronização em tempo real...");

  // Fazer unsubscribe de todos os canais ativos
  activeChannels.forEach((channel) => {
    try {
      if (channel) {
        // Usar a API correta do Supabase para unsubscribe
        supabase.removeChannel(channel);
      }
    } catch (error) {
      console.warn("Erro ao fazer unsubscribe do canal:", error);
    }
  });

  // Limpar array de canais
  activeChannels = [];

  console.log("✅ Sincronização em tempo real parada!");
};

// Hook para monitorar status da conexão
export const useRealtimeStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("connection_status")
      .on("system", {}, (payload) => {
        if (payload.extension === "postgres_changes") {
          setIsConnected(true);
          setLastUpdate(new Date());
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isConnected, lastUpdate };
};

// Função para forçar sincronização manual
export const forceSync = (queryClient: QueryClient, queryKey?: string[]) => {
  console.log("🔄 Forçando sincronização...");

  if (queryKey) {
    // Sincronizar query específica
    queryClient.invalidateQueries({ queryKey });
  } else {
    // Sincronizar todas as queries
    REALTIME_CONFIGS.forEach((config) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    });
  }

  console.log("✅ Sincronização forçada!");
};
