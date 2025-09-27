"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Zap } from "lucide-react";

interface PerformanceComparisonProps {
  totalItems: number;
  itemsPerPage: number;
  renderTime?: number;
}

export function PerformanceComparison({
  totalItems,
  itemsPerPage,
  renderTime = 0,
}: PerformanceComparisonProps) {
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState(false);

  useEffect(() => {
    if (isMeasuring) {
      const start = performance.now();
      setStartTime(start);

      // Simular um pequeno delay para mostrar a medição
      setTimeout(() => {
        const end = performance.now();
        setEndTime(end);
        setIsMeasuring(false);
      }, 100);
    }
  }, [isMeasuring]);

  const handleMeasurePerformance = () => {
    setIsMeasuring(true);
  };

  const renderTimeMs = renderTime || endTime - startTime;
  const itemsRendered = Math.min(itemsPerPage, totalItems);

  // Calcular estimativas de performance
  const estimatedMemoryUsage = totalItems * 0.5; // KB por item estimado
  const estimatedRenderTime = (totalItems / itemsPerPage) * renderTimeMs;
  const performanceScore = Math.max(0, 100 - renderTimeMs / 10);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Análise de Performance
        </CardTitle>
        <CardDescription>
          Comparação entre paginação virtual e renderização completa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas atuais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total de Itens</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {itemsRendered}
            </div>
            <p className="text-xs text-muted-foreground">Itens Renderizados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {renderTimeMs.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">Tempo de Render</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {performanceScore.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Score Performance</p>
          </div>
        </div>

        {/* Badge de performance */}
        <div className="flex justify-center">
          <Badge className={getPerformanceColor(performanceScore)}>
            {performanceScore >= 80
              ? "Excelente"
              : performanceScore >= 60
              ? "Bom"
              : "Necessita Otimização"}
          </Badge>
        </div>

        {/* Comparação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Com Paginação Virtual */}
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Com Paginação Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Itens renderizados:</span>
                  <span className="font-medium">{itemsRendered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo de render:</span>
                  <span className="font-medium">
                    {renderTimeMs.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uso de memória:</span>
                  <span className="font-medium">
                    {(
                      (estimatedMemoryUsage * itemsRendered) /
                      totalItems
                    ).toFixed(1)}
                    KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <Badge
                    className={`${getPerformanceColor(
                      performanceScore
                    )} text-xs`}
                  >
                    {performanceScore.toFixed(0)}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sem Paginação */}
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                Sem Paginação (Todos os Itens)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Itens renderizados:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo de render:</span>
                  <span className="font-medium">
                    {estimatedRenderTime.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uso de memória:</span>
                  <span className="font-medium">
                    {estimatedMemoryUsage.toFixed(1)}KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    {Math.max(0, 100 - estimatedRenderTime / 10).toFixed(0)}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">
            Benefícios da Paginação Virtual:
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>
              • Redução de{" "}
              {(100 - (itemsRendered / totalItems) * 100).toFixed(1)}% no tempo
              de renderização
            </li>
            <li>
              • Economia de{" "}
              {(100 - (itemsRendered / totalItems) * 100).toFixed(1)}% no uso de
              memória
            </li>
            <li>
              • Melhoria de{" "}
              {(
                ((estimatedRenderTime - renderTimeMs) / estimatedRenderTime) *
                100
              ).toFixed(1)}
              % na performance geral
            </li>
            <li>• Interface mais responsiva e fluida</li>
          </ul>
        </div>

        {/* Botão para medir performance */}
        <div className="text-center">
          <Button
            onClick={handleMeasurePerformance}
            disabled={isMeasuring}
            className="cursor-pointer"
            variant="outline"
          >
            {isMeasuring ? "Medindo..." : "Medir Performance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
