import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Configurações de TTL por tipo de dados
export const CACHE_CONFIG = {
  employees: { 
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora
    refetchInterval: 30 * 60 * 1000, // 30 min
  },
  equipment: { 
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora
    refetchInterval: 30 * 60 * 1000, // 30 min
  },
  vehicles: { 
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora
    refetchInterval: 30 * 60 * 1000, // 30 min
  },
  movements: { 
    staleTime: 2 * 60 * 1000,  // 2 minutos (dados dinâmicos)
    gcTime: 10 * 60 * 1000,    // 10 minutos
    refetchInterval: 2 * 60 * 1000, // 2 min
  },
  maintenances: { 
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 20 * 60 * 1000,    // 20 minutos
    refetchInterval: 5 * 60 * 1000, // 5 min
  },
  fuels: { 
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 20 * 60 * 1000,    // 20 minutos
    refetchInterval: 5 * 60 * 1000, // 5 min
  },
  scheduledMaintenances: { 
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora
    refetchInterval: 30 * 60 * 1000, // 30 min
  },
};

// Configuração do QueryClient com otimizações de performance e persistência
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos (300 segundos) - padrão
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos após ficarem "stale"
      gcTime: 10 * 60 * 1000,
      // Refetch quando a janela ganha foco (para dados críticos)
      refetchOnWindowFocus: true,
      // Refetch quando reconectar à internet
      refetchOnReconnect: true,
      // Retry apenas 1 vez em caso de erro
      retry: 1,
      // Retry delay de 1 segundo
      retryDelay: 1000,
    },
    mutations: {
      // Retry mutações apenas 1 vez
      retry: 1,
      // Retry delay de 1 segundo para mutações
      retryDelay: 1000,
    },
  },
});

// Configuração do persister para localStorage
export const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'react-query-cache',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
  // Filtrar queries que não devem ser persistidas
  filter: (query) => {
    // Não persistir queries de erro
    if (query.state.status === 'error') return false;
    // Não persistir queries muito grandes (mais de 1MB)
    const size = new Blob([JSON.stringify(query.state.data)]).size;
    return size < 1024 * 1024; // 1MB
  },
});

// Função para inicializar persistência (apenas no cliente)
export const initializePersist = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    await persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      hydrateOptions: {
        // Opções de hidratação
        defaultOptions: {
          queries: {
            // Não refetch imediatamente após hidratação
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      },
    });
    console.log('✅ Cache persistente inicializado');
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar cache persistente:', error);
  }
};

// Chaves de query para organização e invalidação
export const queryKeys = {
  employees: ["employees"] as const,
  employee: (id: string) => ["employees", id] as const,
  equipment: ["equipment"] as const,
  equipmentItem: (id: string) => ["equipment", id] as const,
  vehicles: ["vehicles"] as const,
  vehicle: (id: string) => ["vehicles", id] as const,
  equipmentMovements: ["equipment-movements"] as const,
  equipmentMovementsByEquipment: (equipmentId: string) =>
    ["equipment-movements", "equipment", equipmentId] as const,
  equipmentMovementsByEmployee: (employeeId: string) =>
    ["equipment-movements", "employee", employeeId] as const,
  vehicleMaintenances: ["vehicle-maintenances"] as const,
  vehicleMaintenancesByVehicle: (vehicleId: string) =>
    ["vehicle-maintenances", "vehicle", vehicleId] as const,
  vehicleFuels: ["vehicle-fuels"] as const,
  vehicleFuelsByVehicle: (vehicleId: string) =>
    ["vehicle-fuels", "vehicle", vehicleId] as const,
  vehicleScheduledMaintenances: ["vehicle-scheduled-maintenances"] as const,
  vehicleScheduledMaintenancesByVehicle: (vehicleId: string) =>
    ["vehicle-scheduled-maintenances", "vehicle", vehicleId] as const,
} as const;
