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

export function ReportsCharts() {
  const equipmentData = [
    { month: "Jan", utilizacao: 85, manutencao: 12 },
    { month: "Fev", utilizacao: 78, manutencao: 15 },
    { month: "Mar", utilizacao: 92, manutencao: 8 },
    { month: "Abr", utilizacao: 88, manutencao: 10 },
    { month: "Mai", utilizacao: 95, manutencao: 6 },
    { month: "Jun", utilizacao: 89, manutencao: 14 },
  ]

  const costData = [
    { month: "Jan", equipamentos: 15000, manutencao: 8000, combustivel: 12000 },
    { month: "Fev", equipamentos: 18000, manutencao: 9500, combustivel: 11500 },
    { month: "Mar", equipamentos: 16500, manutencao: 7200, combustivel: 13200 },
    { month: "Abr", equipamentos: 19200, manutencao: 10800, combustivel: 12800 },
    { month: "Mai", equipamentos: 17800, manutencao: 6900, combustivel: 14100 },
    { month: "Jun", equipamentos: 20500, manutencao: 11200, combustivel: 13600 },
  ]

  const statusData = [
    { name: "Disponível", value: 45, color: "#22c55e" },
    { name: "Em Uso", value: 32, color: "#3b82f6" },
    { name: "Manutenção", value: 8, color: "#f59e0b" },
    { name: "Indisponível", value: 5, color: "#ef4444" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Utilização de Equipamentos</CardTitle>
          <CardDescription>Taxa de utilização vs. tempo em manutenção (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={equipmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilizacao" fill="#3b82f6" name="Utilização" />
              <Bar dataKey="manutencao" fill="#f59e0b" name="Manutenção" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Equipamentos</CardTitle>
          <CardDescription>Distribuição atual por status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Análise de Custos Mensais</CardTitle>
          <CardDescription>Evolução dos custos por categoria (R$)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="equipamentos" stroke="#3b82f6" name="Equipamentos" strokeWidth={2} />
              <Line type="monotone" dataKey="manutencao" stroke="#f59e0b" name="Manutenção" strokeWidth={2} />
              <Line type="monotone" dataKey="combustivel" stroke="#22c55e" name="Combustível" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
