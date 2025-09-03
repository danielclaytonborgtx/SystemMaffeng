"use client"  // <- Adicione isto no topo do arquivo

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", equipamentos: 45, manutencoes: 12 },
  { name: "Fev", equipamentos: 52, manutencoes: 8 },
  { name: "Mar", equipamentos: 48, manutencoes: 15 },
  { name: "Abr", equipamentos: 61, manutencoes: 10 },
  { name: "Mai", equipamentos: 55, manutencoes: 18 },
  { name: "Jun", equipamentos: 67, manutencoes: 14 },
]

export function DashboardCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentação Mensal</CardTitle>
        <CardDescription>Equipamentos utilizados e manutenções realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="equipamentos" fill="hsl(var(--chart-1))" />
            <Bar dataKey="manutencoes" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
