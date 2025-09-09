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
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle>Movimentação Mensal</CardTitle>
        <CardDescription>Equipamentos utilizados e manutenções realizadas</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(59, 130, 246, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="equipamentos" 
              fill="url(#equipamentosGradient)" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-300"
            />
            <Bar 
              dataKey="manutencoes" 
              fill="url(#manutencoesGradient)" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-300"
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
