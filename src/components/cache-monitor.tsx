"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Database,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Eye,
  EyeOff,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUsageMetrics, cleanupOldMetrics } from "@/lib/background-refresh";
import { useRealtimeStatus } from "@/lib/realtime-sync";

interface CacheMetrics {
  totalQueries: number;
  cacheHits: number;
  staleData: number;
  dataAge: number;
  memoryUsage: number;
  lastSync: Date | null;
  isOnline: boolean;
}

interface CacheMonitorProps {
  className?: string;
}

export function CacheMonitor({ className }: CacheMonitorProps) {
  const queryClient = useQueryClient();
  const { isConnected, lastUpdate } = useRealtimeStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<CacheMetrics>({
    totalQueries: 0,
    cacheHits: 0,
    staleData: 0,
    dataAge: 0,
    memoryUsage: 0,
    lastSync: null,
    isOnline: navigator.onLine,
  });

  // Atualizar métricas periodicamente
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const updateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      let totalQueries = queries.length;
      let cacheHits = 0;
      let staleData = 0;
      let totalAge = 0;

      queries.forEach((query) => {
        const state = query.state;

        // Contar cache hits (queries com dados válidos)
        if (state.status === "success" && state.data) {
          cacheHits++;

          // Verificar se dados estão stale
          const dataUpdatedAt = state.dataUpdatedAt;
          const staleTime = query.options.staleTime || 5 * 60 * 1000;
          const isStale = Date.now() - dataUpdatedAt > staleTime;

          if (isStale) {
            staleData++;
          }

          // Calcular idade dos dados
          totalAge += Date.now() - dataUpdatedAt;
        }
      });

      // Calcular uso de memória (estimativa)
      const memoryUsage = JSON.stringify(queries).length / 1024; // KB

      // Obter métricas de uso
      const usageMetrics = getUsageMetrics();

      setMetrics({
        totalQueries,
        cacheHits,
        staleData,
        dataAge: totalQueries > 0 ? totalAge / totalQueries : 0,
        memoryUsage,
        lastSync: lastUpdate,
        isOnline: navigator.onLine,
      });

      // Limpar métricas antigas
      cleanupOldMetrics();
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [queryClient, lastUpdate]);

  // Atualizar status online/offline
  useEffect(() => {
    const handleOnline = () =>
      setMetrics((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setMetrics((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const cacheHitRate =
    metrics.totalQueries > 0
      ? (metrics.cacheHits / metrics.totalQueries) * 100
      : 0;

  const staleRate =
    metrics.totalQueries > 0
      ? (metrics.staleData / metrics.totalQueries) * 100
      : 0;

  const averageDataAge = Math.floor(metrics.dataAge / (1000 * 60)); // minutos

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Nunca";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`;
    return `há ${Math.floor(diffInSeconds / 3600)}h`;
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap className="h-5 w-5 text-blue-500" />
      </Button>

      {isOpen && (
        <Card className="w-80 bg-background shadow-xl border-l-4 border-blue-500 mt-2 max-h-96 overflow-y-auto">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Monitor de Cache Avançado
            </CardTitle>
            <CardDescription className="text-xs">
              Métricas em tempo real (Dev Only)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 text-sm space-y-4">
            {/* Status de Conexão */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metrics.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>Status:</span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  metrics.isOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {metrics.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Realtime Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span>Realtime:</span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  isConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isConnected ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {/* Cache Hit Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Cache Hit Rate:</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {cacheHitRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={cacheHitRate} className="h-2" />
            </div>

            {/* Stale Data Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Dados Stale:</span>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    staleRate < 20
                      ? "bg-green-100 text-green-800"
                      : staleRate < 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {staleRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={staleRate} className="h-2" />
            </div>

            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {metrics.totalQueries}
                </div>
                <div className="text-xs text-muted-foreground">Queries</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {metrics.cacheHits}
                </div>
                <div className="text-xs text-muted-foreground">Cache Hits</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {averageDataAge}min
                </div>
                <div className="text-xs text-muted-foreground">Idade Média</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {metrics.memoryUsage.toFixed(1)}KB
                </div>
                <div className="text-xs text-muted-foreground">Memória</div>
              </div>
            </div>

            {/* Última Sincronização */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-gray-600" />
                <span>Última Sync:</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(metrics.lastSync)}
              </span>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  queryClient.invalidateQueries();
                  console.log("🔄 Cache invalidado manualmente");
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  queryClient.clear();
                  console.log("🗑️ Cache limpo");
                }}
              >
                <HardDrive className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
