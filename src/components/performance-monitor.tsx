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
import { Activity, Database, Zap, Clock } from "lucide-react";

interface QueryMetrics {
  queryKey: string;
  status: "success" | "error" | "pending";
  fetchTime: number;
  cacheHit: boolean;
  timestamp: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<QueryMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Monitor React Query metrics
    const interval = setInterval(() => {
      // Simular coleta de métricas do React Query
      const mockMetrics: QueryMetrics[] = [
        {
          queryKey: "employees",
          status: "success",
          fetchTime: 120,
          cacheHit: true,
          timestamp: Date.now(),
        },
        {
          queryKey: "equipment",
          status: "success",
          fetchTime: 95,
          cacheHit: true,
          timestamp: Date.now() - 1000,
        },
        {
          queryKey: "vehicles",
          status: "success",
          fetchTime: 110,
          cacheHit: false,
          timestamp: Date.now() - 2000,
        },
      ];

      setMetrics(mockMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance Monitor
      </Button>
    );
  }

  const cacheHitRate =
    metrics.length > 0
      ? (metrics.filter((m) => m.cacheHit).length / metrics.length) * 100
      : 0;

  const avgFetchTime =
    metrics.length > 0
      ? metrics.reduce((acc, m) => acc + m.fetchTime, 0) / metrics.length
      : 0;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            Performance Monitor
          </CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <CardDescription className="text-xs">
          React Query Performance Metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3 text-blue-600" />
            <span>Cache Hit:</span>
            <Badge variant="secondary" className="text-xs">
              {cacheHitRate.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-orange-600" />
            <span>Avg Time:</span>
            <Badge variant="secondary" className="text-xs">
              {avgFetchTime.toFixed(0)}ms
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Recent Queries:
          </div>
          {metrics.slice(0, 3).map((metric, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="font-mono">{metric.queryKey}</span>
              <div className="flex items-center gap-1">
                {metric.cacheHit && (
                  <Badge variant="outline" className="text-xs px-1">
                    Cache
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  {metric.fetchTime}ms
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-yellow-600" />
            <span>React Query v5 Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
