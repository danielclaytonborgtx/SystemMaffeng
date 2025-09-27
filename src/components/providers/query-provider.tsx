"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient, initializePersist } from "@/lib/query-client";
import { initializeRealtimeSync, stopRealtimeSync } from "@/lib/realtime-sync";
import { initializeBackgroundRefresh } from "@/lib/background-refresh";
import { useEffect } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Inicializar persistência, WebSocket e background refresh
  useEffect(() => {
    const initializeServices = async () => {
      // Inicializar cache persistente
      await initializePersist();

      // Inicializar sincronização em tempo real (corrigida)
      initializeRealtimeSync(queryClient);

      // Inicializar background refresh inteligente
      const stopBackgroundRefresh = initializeBackgroundRefresh(queryClient);

      return stopBackgroundRefresh;
    };

    let stopBackgroundRefresh: (() => void) | undefined;

    initializeServices().then((cleanup) => {
      stopBackgroundRefresh = cleanup;
    });

    // Cleanup quando o componente desmontar
    return () => {
      stopRealtimeSync();
      if (stopBackgroundRefresh) {
        stopBackgroundRefresh();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
