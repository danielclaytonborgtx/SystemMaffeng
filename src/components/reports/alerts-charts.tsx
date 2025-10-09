"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useEffect, useState } from "react"
import { useAlerts } from "@/hooks"

export function AlertsCharts() {
  const { 
    criticalCount, 
    warningCount, 
    infoCount,
    alertsByCategory 
  } = useAlerts()
  
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    
    checkTheme()
    
    // Observer para detectar mudanças no tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const severityData = [
    { name: "Críticos", value: criticalCount, color: "#ef4444" },
    { name: "Atenção", value: warningCount, color: "#f59e0b" },
    { name: "Info", value: infoCount, color: "#3b82f6" },
  ].filter(item => item.value > 0)

  const categoryData = [
    { name: "Manutenção", value: alertsByCategory.manutenção.length },
    { name: "Documentação", value: alertsByCategory.documentação.length },
    { name: "Equipamento", value: alertsByCategory.equipamento.length },
    { name: "Colaborador", value: alertsByCategory.colaborador.length },
  ].filter(item => item.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Alertas por Severidade</CardTitle>
          <CardDescription>
            Distribuição dos alertas por nível de prioridade ({criticalCount + warningCount + infoCount} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {severityData.length > 0 ? (
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div 
                          style={{
                            backgroundColor: isDark ? "#1f2937" : "hsl(var(--popover))",
                            border: isDark ? "1px solid #374151" : "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            boxShadow: isDark ? "0 10px 25px rgba(0,0,0,0.3)" : "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p style={{ 
                            color: isDark ? "#b4b4b4" : "hsl(var(--popover-foreground))",
                            margin: 0,
                            fontSize: "14px"
                          }}>
                            {`${payload[0].name}: ${payload[0].value}`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum alerta ativo
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertas por Categoria</CardTitle>
          <CardDescription>
            Distribuição dos alertas por tipo de ocorrência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {categoryData.length > 0 ? (
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={isDark ? {
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#b4b4b4",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  } : {
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" name="Quantidade" />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum alerta ativo
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

