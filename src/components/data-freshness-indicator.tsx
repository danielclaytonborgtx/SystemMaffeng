"use client";

import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Clock, Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface DataFreshnessIndicatorProps {
  queryKey: string[];
  className?: string;
  showDetails?: boolean;
}

export function DataFreshnessIndicator({ 
  queryKey, 
  className,
  showDetails = false 
}: DataFreshnessIndicatorProps) {
  const queryClient = useQueryClient();

  const freshnessData = useMemo(() => {
    const query = queryClient.getQueryState(queryKey);
    
    if (!query || query.status !== 'success' || !query.dataUpdatedAt) {
      return {
        isOnline: navigator.onLine,
        lastUpdate: null,
        isStale: false,
        status: 'no-data' as const,
      };
    }

    const now = Date.now();
    const lastUpdate = new Date(query.dataUpdatedAt);
    const staleTime = query.options.staleTime || 5 * 60 * 1000; // 5 min padrão
    const timeSinceUpdate = now - query.dataUpdatedAt;
    const isStale = timeSinceUpdate > staleTime;
    
    let status: 'fresh' | 'stale' | 'very-stale' | 'offline' = 'fresh';
    
    if (!navigator.onLine) {
      status = 'offline';
    } else if (isStale) {
      if (timeSinceUpdate > staleTime * 3) {
        status = 'very-stale';
      } else {
        status = 'stale';
      }
    }

    return {
      isOnline: navigator.onLine,
      lastUpdate,
      isStale,
      status,
      timeSinceUpdate,
    };
  }, [queryClient, queryKey]);

  const getStatusConfig = () => {
    switch (freshnessData.status) {
      case 'fresh':
        return {
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <Clock className="h-3 w-3" />,
          text: 'Atualizado',
        };
      case 'stale':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-3 w-3" />,
          text: 'Desatualizado',
        };
      case 'very-stale':
        return {
          variant: 'secondary' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Muito Antigo',
        };
      case 'offline':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Offline',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-3 w-3" />,
          text: 'Sem Dados',
        };
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Nunca";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)} dias`;
  };

  const config = getStatusConfig();

  if (!showDetails) {
    return (
      <Badge 
        variant={config.variant} 
        className={`text-xs ${config.className} ${className}`}
      >
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className={`text-xs ${config.className}`}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </Badge>
      
      {freshnessData.lastUpdate && (
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(freshnessData.lastUpdate)}
        </span>
      )}
      
      {!freshnessData.isOnline && (
        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
    </div>
  );
}

// Hook para usar o indicador em qualquer componente
export function useDataFreshness(queryKey: string[]) {
  const queryClient = useQueryClient();
  
  return useMemo(() => {
    const query = queryClient.getQueryState(queryKey);
    
    if (!query || query.status !== 'success' || !query.dataUpdatedAt) {
      return {
        isStale: true,
        lastUpdate: null,
        timeSinceUpdate: Infinity,
        isOnline: navigator.onLine,
      };
    }

    const now = Date.now();
    const staleTime = query.options.staleTime || 5 * 60 * 1000;
    const timeSinceUpdate = now - query.dataUpdatedAt;
    const isStale = timeSinceUpdate > staleTime;

    return {
      isStale,
      lastUpdate: new Date(query.dataUpdatedAt),
      timeSinceUpdate,
      isOnline: navigator.onLine,
    };
  }, [queryClient, queryKey]);
}
