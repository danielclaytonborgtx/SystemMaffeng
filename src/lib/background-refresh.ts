"use client";

import { QueryClient } from "@tanstack/react-query";
import { queryKeys, CACHE_CONFIG } from "@/lib/query-client";

// Interface para métricas de uso
interface UsageMetrics {
  queryKey: string;
  lastAccessed: Date;
  accessCount: number;
  averageAccessInterval: number;
}

// Interface para configuração de refresh adaptativo
interface AdaptiveRefreshConfig {
  queryKey: string;
  baseInterval: number;
  minInterval: number;
  maxInterval: number;
  usageMultiplier: number;
}

// Configurações de refresh adaptativo por tipo de dados
const ADAPTIVE_REFRESH_CONFIGS: AdaptiveRefreshConfig[] = [
  {
    queryKey: "employees",
    baseInterval: CACHE_CONFIG.employees.refetchInterval,
    minInterval: 5 * 60 * 1000,   // 5 min
    maxInterval: 60 * 60 * 1000,  // 1 hora
    usageMultiplier: 0.8,         // Reduzir 20% para uso intenso
  },
  {
    queryKey: "equipment",
    baseInterval: CACHE_CONFIG.equipment.refetchInterval,
    minInterval: 5 * 60 * 1000,
    maxInterval: 60 * 60 * 1000,
    usageMultiplier: 0.8,
  },
  {
    queryKey: "vehicles",
    baseInterval: CACHE_CONFIG.vehicles.refetchInterval,
    minInterval: 5 * 60 * 1000,
    maxInterval: 60 * 60 * 1000,
    usageMultiplier: 0.8,
  },
  {
    queryKey: "equipment-movements",
    baseInterval: CACHE_CONFIG.movements.refetchInterval,
    minInterval: 30 * 1000,       // 30 seg
    maxInterval: 10 * 60 * 1000,  // 10 min
    usageMultiplier: 0.5,         // Reduzir 50% para uso intenso
  },
  {
    queryKey: "vehicle-maintenances",
    baseInterval: CACHE_CONFIG.maintenances.refetchInterval,
    minInterval: 2 * 60 * 1000,   // 2 min
    maxInterval: 30 * 60 * 1000,  // 30 min
    usageMultiplier: 0.7,
  },
];

// Armazenamento de métricas de uso
let usageMetrics: Map<string, UsageMetrics> = new Map();

// Função para registrar acesso a uma query
export const trackQueryAccess = (queryKey: string[]) => {
  const key = queryKey.join(":");
  const now = new Date();
  
  const existing = usageMetrics.get(key);
  
  if (existing) {
    const timeDiff = now.getTime() - existing.lastAccessed.getTime();
    const newAverageInterval = (existing.averageAccessInterval + timeDiff) / 2;
    
    usageMetrics.set(key, {
      queryKey: key,
      lastAccessed: now,
      accessCount: existing.accessCount + 1,
      averageAccessInterval: newAverageInterval,
    });
  } else {
    usageMetrics.set(key, {
      queryKey: key,
      lastAccessed: now,
      accessCount: 1,
      averageAccessInterval: 0,
    });
  }
};

// Função para calcular intervalo adaptativo
export const calculateAdaptiveInterval = (queryKey: string[]): number => {
  const key = queryKey.join(":");
  const metrics = usageMetrics.get(key);
  const config = ADAPTIVE_REFRESH_CONFIGS.find(c => c.queryKey === key);
  
  if (!metrics || !config) {
    return config?.baseInterval || 5 * 60 * 1000;
  }
  
  // Calcular frequência de uso (acessos por hora)
  const hoursSinceFirstAccess = (Date.now() - metrics.lastAccessed.getTime()) / (1000 * 60 * 60);
  const usageFrequency = metrics.accessCount / Math.max(hoursSinceFirstAccess, 1);
  
  let adaptiveInterval = config.baseInterval;
  
  // Ajustar baseado na frequência de uso
  if (usageFrequency > 10) {
    // Uso muito intenso - reduzir intervalo
    adaptiveInterval = config.baseInterval * config.usageMultiplier;
  } else if (usageFrequency > 5) {
    // Uso intenso - reduzir ligeiramente
    adaptiveInterval = config.baseInterval * 0.9;
  } else if (usageFrequency < 1) {
    // Uso baixo - aumentar intervalo
    adaptiveInterval = config.baseInterval * 1.5;
  }
  
  // Aplicar limites
  adaptiveInterval = Math.max(adaptiveInterval, config.minInterval);
  adaptiveInterval = Math.min(adaptiveInterval, config.maxInterval);
  
  return adaptiveInterval;
};

// Função para verificar se deve fazer refresh
export const shouldRefresh = (queryKey: string[]): boolean => {
  const key = queryKey.join(":");
  const metrics = usageMetrics.get(key);
  
  if (!metrics) return true;
  
  const timeSinceLastAccess = Date.now() - metrics.lastAccessed.getTime();
  const adaptiveInterval = calculateAdaptiveInterval(queryKey);
  
  // Fazer refresh se passou do tempo adaptativo
  return timeSinceLastAccess >= adaptiveInterval;
};

// Função para refresh inteligente em background
export const intelligentBackgroundRefresh = (queryClient: QueryClient) => {
  console.log("🧠 Iniciando background refresh inteligente...");
  
  const refreshInterval = setInterval(() => {
    // Verificar cada query configurada
    ADAPTIVE_REFRESH_CONFIGS.forEach((config) => {
      const queryKey = [config.queryKey];
      
      if (shouldRefresh(queryKey)) {
        console.log(`🔄 Refresh adaptativo para ${config.queryKey}`);
        
        // Fazer refresh apenas se a query está ativa
        const query = queryClient.getQueryState(queryKey);
        if (query && query.status === 'success') {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    });
  }, 30 * 1000); // Verificar a cada 30 segundos
  
  return () => clearInterval(refreshInterval);
};

// Função para refresh baseado em visibilidade da página
export const setupVisibilityRefresh = (queryClient: QueryClient) => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      console.log("👁️ Página visível - verificando atualizações...");
      
      // Refresh de todas as queries quando a página volta a ser visível
      Object.values(queryKeys).forEach((key) => {
        if (Array.isArray(key)) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      });
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Função para refresh baseado em conexão
export const setupConnectionRefresh = (queryClient: QueryClient) => {
  const handleOnline = () => {
    console.log("🌐 Conexão restaurada - sincronizando dados...");
    
    // Refresh crítico quando voltar online
    const criticalQueries = [
      queryKeys.equipmentMovements,
      queryKeys.vehicleMaintenances,
      queryKeys.vehicleFuels,
    ];
    
    criticalQueries.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };
  
  window.addEventListener('online', handleOnline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Função para refresh baseado em foco da janela
export const setupFocusRefresh = (queryClient: QueryClient) => {
  const handleFocus = () => {
    console.log("🎯 Janela em foco - atualizando dados críticos...");
    
    // Refresh apenas dados críticos quando ganha foco
    const criticalQueries = [
      queryKeys.equipmentMovements,
      queryKeys.vehicleMaintenances,
    ];
    
    criticalQueries.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };
  
  window.addEventListener('focus', handleFocus);
  
  return () => {
    window.removeEventListener('focus', handleFocus);
  };
};

// Função principal para inicializar background refresh
export const initializeBackgroundRefresh = (queryClient: QueryClient) => {
  console.log("🚀 Inicializando sistema de background refresh...");
  
  const cleanupFunctions = [
    intelligentBackgroundRefresh(queryClient),
    setupVisibilityRefresh(queryClient),
    setupConnectionRefresh(queryClient),
    setupFocusRefresh(queryClient),
  ];
  
  return () => {
    console.log("🛑 Parando sistema de background refresh...");
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};

// Função para obter métricas de uso
export const getUsageMetrics = (): UsageMetrics[] => {
  return Array.from(usageMetrics.values());
};

// Função para limpar métricas antigas
export const cleanupOldMetrics = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  usageMetrics.forEach((metrics, key) => {
    if (metrics.lastAccessed.getTime() < oneHourAgo) {
      usageMetrics.delete(key);
    }
  });
};
