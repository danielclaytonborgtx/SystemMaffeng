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
import { Fuel, Hash, DollarSign, MapPin, FileText, Calendar, Loader2 } from "lucide-react"
import { useVehicleFuels, useVehicleFuelOperations } from "@/hooks"
import { Vehicle } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface FuelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle | null
  onClose: () => void
  onSuccess?: () => void
}

export function FuelDialog({ open, onOpenChange, vehicle, onClose, onSuccess }: FuelDialogProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [formData, setFormData] = useState({
    currentKm: "",
    liters: "",
    cost: "",
    station: "",
    observations: "",
  })

  const { data: fuelHistory, loading: historyLoading, refetch: refetchHistory } = useVehicleFuels(vehicle?.id)
  const { createFuel, loading: createLoading } = useVehicleFuelOperations()
  const { toast } = useToast()

  // Calcular preço por litro automaticamente
  const calculatePricePerLiter = () => {
    const liters = Number.parseFloat(formData.liters)
    const cost = Number.parseFloat(formData.cost)
    if (liters > 0 && cost > 0) {
      return (cost / liters).toFixed(3)
    }
    return "0.000"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vehicle?.id) {
      toast({
        title: "Erro",
        description: "Veículo não encontrado",
        variant: "destructive"
      })
      return
    }

    try {
      // Calcular consumo baseado no último abastecimento
      let consumption = 0
      if (fuelHistory.length > 0) {
        const lastFuelRecord = fuelHistory[0] // O primeiro é o mais recente
        const kmTraveled = Number(formData.currentKm) - lastFuelRecord.current_km
        if (kmTraveled > 0) {
          consumption = kmTraveled / Number(formData.liters)
        }
      }

      const fuelData: any = {
        vehicle_id: vehicle.id,
        vehicle_plate: vehicle.plate,
        vehicle_model: vehicle.model,
        current_km: Number(formData.currentKm),
        liters: Number(formData.liters),
        cost: Number(formData.cost),
        price_per_liter: Number(calculatePricePerLiter()),
        consumption: consumption > 0 ? consumption : undefined,
        station: formData.station,
      }

      // Só adicionar campo opcional se tiver valor
      if (formData.observations && formData.observations.trim()) {
        fuelData.observations = formData.observations
      }

      await createFuel(fuelData)

      toast({
        title: "Sucesso",
        description: "Abastecimento registrado e quilometragem atualizada com sucesso!"
      })

      // Limpar formulário
      setFormData({
        currentKm: "",
        liters: "",
        cost: "",
        station: "",
        observations: "",
      })

      // Recarregar histórico
      refetchHistory()
      
      // Chamar callback de sucesso se fornecido
      onSuccess?.()
      
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar abastecimento",
        variant: "destructive"
      })
    }
  }

  const calculateConsumption = () => {
    const currentKm = Number.parseFloat(formData.currentKm)
    const liters = Number.parseFloat(formData.liters)
    if (currentKm && liters && vehicle?.current_km) {
      const kmTraveled = currentKm - vehicle.current_km
      return kmTraveled > 0 ? (kmTraveled / liters).toFixed(2) : "0"
    }
    return "0"
  }

  // Calcular consumo médio baseado no histórico real
  const averageConsumption = fuelHistory.length > 1
    ? (fuelHistory.slice(0, -1).reduce((sum, record, index) => {
        if (index < fuelHistory.length - 1) {
          const nextRecord = fuelHistory[index + 1]
          const kmTraveled = record.current_km - nextRecord.current_km
          const consumption = kmTraveled > 0 ? kmTraveled / record.liters : 0
          return sum + consumption
        }
        return sum
      }, 0) / Math.max(fuelHistory.length - 1, 1)).toFixed(2)
    : "0"

  const totalSpent = fuelHistory.reduce((sum, record) => sum + record.cost, 0)

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
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
                <div className="text-lg font-bold">{vehicle.current_km?.toLocaleString('pt-BR')} km</div>
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
                    <Label htmlFor="currentKm" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      Quilometragem Atual
                    </Label>
                    <Input
                      id="currentKm"
                      type="number"
                      value={formData.currentKm}
                      onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                      placeholder={vehicle.current_km?.toString()}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liters" className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-green-600" />
                      Litros Abastecidos
                    </Label>
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
                    <Label htmlFor="cost" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Valor Total (R$)
                    </Label>
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
                    <Label htmlFor="pricePerLiter" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      Preço por Litro (R$)
                    </Label>
                    <Input
                      id="pricePerLiter"
                      type="text"
                      value={calculatePricePerLiter()}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                      placeholder="0,000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Calculado automaticamente: Valor Total ÷ Litros
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Posto de Combustível
                  </Label>
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
                  <Label htmlFor="observations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    Observações
                  </Label>
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
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer" disabled={createLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700" disabled={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Abastecimento"
                )}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando histórico...</span>
                </div>
              ) : fuelHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum abastecimento registrado para este veículo
                </div>
              ) : (
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
                    {fuelHistory.map((record, index) => {
                      // Usar consumo salvo no banco ou calcular se não existir
                      let consumption = record.consumption || 0
                      
                      // Se não tem consumo salvo e não é o primeiro registro, calcular
                      if (!record.consumption && index > 0) {
                        const previousRecord = fuelHistory[index - 1]
                        const kmTraveled = record.current_km - previousRecord.current_km
                        consumption = kmTraveled > 0 ? kmTraveled / record.liters : 0
                      }
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.created_at).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>{record.current_km.toLocaleString('pt-BR')} km</TableCell>
                          <TableCell>{record.liters.toFixed(2)} L</TableCell>
                          <TableCell>R$ {record.cost.toFixed(2)}</TableCell>
                          <TableCell>R$ {record.price_per_liter.toFixed(3)}</TableCell>
                          <TableCell>{consumption > 0 ? consumption.toFixed(2) : '-'} km/l</TableCell>
                          <TableCell>{record.station}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
