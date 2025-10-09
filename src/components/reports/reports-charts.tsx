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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useMemo, useEffect, useState } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export function ReportsCharts() {
  const { data: employees } = useEmployees()
  const { data: equipment } = useEquipment()
  const { data: vehicles } = useVehicles()
  
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
  const equipmentData = useMemo(() => {
    const total = equipment.length
    const available = equipment.filter(eq => eq.status === 'available').length
    const inUse = equipment.filter(eq => eq.status === 'in_use').length
    const maintenance = equipment.filter(eq => eq.status === 'maintenance').length
    
    return [
      { name: "Disponíveis", value: available, percentage: total > 0 ? Math.round((available / total) * 100) : 0 },
      { name: "Em Uso", value: inUse, percentage: total > 0 ? Math.round((inUse / total) * 100) : 0 },
      { name: "Manutenção", value: maintenance, percentage: total > 0 ? Math.round((maintenance / total) * 100) : 0 },
    ]
  }, [equipment])

  const vehicleData = useMemo(() => {
    const total = vehicles.length
    const active = vehicles.filter(v => v.status === 'active').length
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length
    
    return [
      { name: "Ativos", value: active, percentage: total > 0 ? Math.round((active / total) * 100) : 0 },
      { name: "Manutenção", value: maintenance, percentage: total > 0 ? Math.round((maintenance / total) * 100) : 0 },
    ]
  }, [vehicles])

  const employeeData = useMemo(() => {
    const total = employees.length
    const active = employees.filter(emp => emp.status === 'active').length
    const vacation = employees.filter(emp => emp.status === 'vacation').length
    const away = employees.filter(emp => emp.status === 'away').length
    
    return [
      { name: "Ativos", value: active, percentage: total > 0 ? Math.round((active / total) * 100) : 0 },
      { name: "Férias", value: vacation, percentage: total > 0 ? Math.round((vacation / total) * 100) : 0 },
      { name: "Ausentes", value: away, percentage: total > 0 ? Math.round((away / total) * 100) : 0 },
    ]
  }, [employees])

  const statusData = useMemo(() => [
    { name: "Disponível", value: equipment.filter(eq => eq.status === 'available').length, color: "#22c55e" },
    { name: "Em Uso", value: equipment.filter(eq => eq.status === 'in_use').length, color: "#3b82f6" },
    { name: "Manutenção", value: equipment.filter(eq => eq.status === 'maintenance').length, color: "#f59e0b" },
    { name: "Aposentado", value: equipment.filter(eq => eq.status === 'retired').length, color: "#ef4444" },
  ], [equipment])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status dos Equipamentos</CardTitle>
          <CardDescription>Distribuição atual por status ({equipment.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={equipmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={isDark ? {
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  fontSize: "14px",
                  fontWeight: "500"
                } : {
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#1f2937",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Veículos</CardTitle>
          <CardDescription>Distribuição atual por status ({vehicles.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {vehicleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "#f59e0b"} />
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
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Status dos Colaboradores</CardTitle>
          <CardDescription>Distribuição atual por status ({employees.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={isDark ? {
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  fontSize: "14px",
                  fontWeight: "500"
                } : {
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#1f2937",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
