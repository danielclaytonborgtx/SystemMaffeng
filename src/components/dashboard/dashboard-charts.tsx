"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { memo, useMemo } from "react"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"

export const DashboardCharts = memo(function DashboardCharts() {
  const { data: employees } = useEmployees()
  const { data: equipment } = useEquipment()
  const { data: vehicles } = useVehicles()

  const chartData = useMemo(() => {
    // Dados baseados em dados reais do Firestore
    const totalEmployees = employees.length
    const totalEquipment = equipment.length
    const totalVehicles = vehicles.length
    
    return [
      { 
        name: "Colaboradores", 
        total: totalEmployees, 
        disponiveis: employees.filter(e => e.status === 'active').length 
      },
      { 
        name: "Equipamentos", 
        total: totalEquipment, 
        disponiveis: equipment.filter(e => e.status === 'available').length 
      },
      { 
        name: "Veículos", 
        total: totalVehicles, 
        disponiveis: vehicles.filter(v => v.status === 'active').length 
      },
    ]
  }, [employees, equipment, vehicles])

  return (
    <Card className="border shadow-lg bg-card">
      <CardHeader>
        <CardTitle>Resumo Geral</CardTitle>
        <CardDescription>Total e disponibilidade de recursos</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="stroke-muted-foreground" />
            <YAxis className="stroke-muted-foreground" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="total" 
              fill="url(#totalGradient)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="disponiveis" 
              fill="url(#disponiveisGradient)" 
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="disponiveisGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
