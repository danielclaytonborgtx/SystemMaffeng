"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FuelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
}

// Mock data para histórico de combustível
const fuelHistory = [
  {
    id: 1,
    date: "2024-03-15",
    km: 45000,
    liters: 120,
    cost: 720.0,
    pricePerLiter: 6.0,
    consumption: 8.5,
    station: "Posto Shell Centro",
  },
  {
    id: 2,
    date: "2024-03-10",
    km: 44000,
    liters: 115,
    cost: 690.0,
    pricePerLiter: 6.0,
    consumption: 8.7,
    station: "Posto BR Norte",
  },
  {
    id: 3,
    date: "2024-03-05",
    km: 43000,
    liters: 118,
    cost: 708.0,
    pricePerLiter: 6.0,
    consumption: 8.5,
    station: "Posto Ipiranga Sul",
  },
]

export function FuelDialog({ open, onOpenChange, vehicle, onClose }: FuelDialogProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [formData, setFormData] = useState({
    currentKm: "",
    liters: "",
    cost: "",
    pricePerLiter: "",
    station: "",
    observations: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registrando abastecimento:", formData)
    onClose()
  }

  const calculateConsumption = () => {
    const currentKm = Number.parseFloat(formData.currentKm)
    const liters = Number.parseFloat(formData.liters)
    if (currentKm && liters && vehicle?.currentKm) {
      const kmTraveled = currentKm - vehicle.currentKm
      return kmTraveled > 0 ? (kmTraveled / liters).toFixed(2) : "0"
    }
    return "0"
  }

  const averageConsumption = fuelHistory.length
    ? (fuelHistory.reduce((sum, record) => sum + record.consumption, 0) / fuelHistory.length).toFixed(2)
    : "0"

  const totalSpent = fuelHistory.reduce((sum, record) => sum + record.cost, 0)

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Controle de Combustível - {vehicle.plate}</DialogTitle>
          <DialogDescription>{vehicle.model}</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Consumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">KM Atual:</span>
                <div className="text-lg font-bold">{vehicle.currentKm?.toLocaleString()} km</div>
              </div>
              <div>
                <span className="font-medium">Consumo Médio:</span>
                <div className="text-lg font-bold">{averageConsumption} km/l</div>
              </div>
              <div>
                <span className="font-medium">Total Gasto:</span>
                <div className="text-lg font-bold">R$ {totalSpent.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium">Abastecimentos:</span>
                <div className="text-lg font-bold">{fuelHistory.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "new" ? "default" : "ghost"}
            onClick={() => setActiveTab("new")}
            className="rounded-b-none cursor-pointer"
          >
            Novo Abastecimento
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="rounded-b-none cursor-pointer"
          >
            Histórico
          </Button>
        </div>

        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Abastecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentKm">Quilometragem Atual</Label>
                    <Input
                      id="currentKm"
                      type="number"
                      value={formData.currentKm}
                      onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                      placeholder={vehicle.currentKm?.toString()}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liters">Litros Abastecidos</Label>
                    <Input
                      id="liters"
                      type="number"
                      step="0.01"
                      value={formData.liters}
                      onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Valor Total (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerLiter">Preço por Litro (R$)</Label>
                    <Input
                      id="pricePerLiter"
                      type="number"
                      step="0.001"
                      value={formData.pricePerLiter}
                      onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                      placeholder="0,000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Posto de Combustível</Label>
                  <Input
                    id="station"
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    placeholder="Nome do posto"
                    required
                  />
                </div>

                {formData.currentKm && formData.liters && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm">
                        <span className="font-medium">Consumo Calculado:</span>
                        <span className="ml-2 text-lg font-bold">{calculateConsumption()} km/l</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observações sobre o abastecimento..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer">Registrar Abastecimento</Button>
            </div>
          </form>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Litros</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Preço/L</TableHead>
                    <TableHead>Consumo</TableHead>
                    <TableHead>Posto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{record.km.toLocaleString()} km</TableCell>
                      <TableCell>{record.liters.toFixed(2)} L</TableCell>
                      <TableCell>R$ {record.cost.toFixed(2)}</TableCell>
                      <TableCell>R$ {record.pricePerLiter.toFixed(3)}</TableCell>
                      <TableCell>{record.consumption.toFixed(2)} km/l</TableCell>
                      <TableCell>{record.station}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
