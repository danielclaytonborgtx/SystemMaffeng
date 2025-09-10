"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { memo, useMemo } from "react"

const data = [
  { name: "Jan", equipamentos: 45, manutencoes: 12 },
  { name: "Fev", equipamentos: 52, manutencoes: 8 },
  { name: "Mar", equipamentos: 48, manutencoes: 15 },
  { name: "Abr", equipamentos: 61, manutencoes: 10 },
  { name: "Mai", equipamentos: 55, manutencoes: 18 },
  { name: "Jun", equipamentos: 67, manutencoes: 14 },
]

export const DashboardCharts = memo(function DashboardCharts() {
  const chartData = useMemo(() => data, [])

  return (
    <Card className="border shadow-lg bg-card">
      <CardHeader>
        <CardTitle>Movimentação Mensal</CardTitle>
        <CardDescription>Equipamentos utilizados e manutenções realizadas</CardDescription>
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
              dataKey="equipamentos" 
              fill="url(#equipamentosGradient)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="manutencoes" 
              fill="url(#manutencoesGradient)" 
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="equipamentosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="manutencoesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
