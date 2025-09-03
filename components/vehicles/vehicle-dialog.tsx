"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
}

export function VehicleDialog({ open, onOpenChange, vehicle, onClose }: VehicleDialogProps) {
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    type: "",
    year: "",
    currentKm: "",
    chassisNumber: "",
    renavam: "",
    color: "",
    fuelType: "",
    engineCapacity: "",
    assignedTo: "",
    status: "Ativo",
    purchaseDate: "",
    purchaseValue: "",
    insuranceExpiry: "",
    licenseExpiry: "",
    observations: "",
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || "",
        model: vehicle.model || "",
        type: vehicle.type || "",
        year: vehicle.year?.toString() || "",
        currentKm: vehicle.currentKm?.toString() || "",
        chassisNumber: vehicle.chassisNumber || "",
        renavam: vehicle.renavam || "",
        color: vehicle.color || "",
        fuelType: vehicle.fuelType || "",
        engineCapacity: vehicle.engineCapacity || "",
        assignedTo: vehicle.assignedTo || "",
        status: vehicle.status || "Ativo",
        purchaseDate: vehicle.purchaseDate || "",
        purchaseValue: vehicle.purchaseValue?.toString() || "",
        insuranceExpiry: vehicle.insuranceExpiry || "",
        licenseExpiry: vehicle.licenseExpiry || "",
        observations: vehicle.observations || "",
      })
    } else {
      setFormData({
        plate: "",
        model: "",
        type: "",
        year: "",
        currentKm: "",
        chassisNumber: "",
        renavam: "",
        color: "",
        fuelType: "",
        engineCapacity: "",
        assignedTo: "",
        status: "Ativo",
        purchaseDate: "",
        purchaseValue: "",
        insuranceExpiry: "",
        licenseExpiry: "",
        observations: "",
      })
    }
  }, [vehicle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Salvando veículo:", formData)
    onClose()
  }

  const isEditing = !!vehicle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalhes do Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Visualize e edite as informações do veículo" : "Cadastre um novo veículo na frota"}
          </DialogDescription>
        </DialogHeader>

        {isEditing && vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {vehicle.plate} - {vehicle.model}
                <Badge
                  variant={vehicle.status === "Ativo" ? "secondary" : "outline"}
                  className={
                    vehicle.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : vehicle.status === "Manutenção"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {vehicle.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">KM Atual:</span>
                  <div className="text-lg font-bold">{vehicle.currentKm?.toLocaleString()} km</div>
                </div>
                <div>
                  <span className="font-medium">Próxima Manutenção:</span>
                  <div className="text-lg font-bold">{vehicle.maintenanceKm?.toLocaleString()} km</div>
                </div>
                <div>
                  <span className="font-medium">Consumo:</span>
                  <div className="text-lg font-bold">{vehicle.fuelConsumption} km/l</div>
                </div>
                <div>
                  <span className="font-medium">Responsável:</span>
                  <div className="text-lg font-bold">{vehicle.assignedTo || "Não atribuído"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa</Label>
                    <Input
                      id="plate"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ex: Volvo FH 540"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Caminhão">Caminhão</SelectItem>
                        <SelectItem value="Caminhonete">Caminhonete</SelectItem>
                        <SelectItem value="Escavadeira">Escavadeira</SelectItem>
                        <SelectItem value="Trator">Trator</SelectItem>
                        <SelectItem value="Betoneira">Betoneira</SelectItem>
                        <SelectItem value="Guindaste">Guindaste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2024"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentKm">Quilometragem Atual</Label>
                    <Input
                      id="currentKm"
                      type="number"
                      value={formData.currentKm}
                      onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Branco"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Número do Chassi</Label>
                  <Input
                    id="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    placeholder="Número do chassi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="renavam">RENAVAM</Label>
                  <Input
                    id="renavam"
                    value={formData.renavam}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                    placeholder="Número do RENAVAM"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceExpiry">Vencimento do Seguro</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">Vencimento do Licenciamento</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Técnicas e Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Tipo de Combustível</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Combustível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Etanol">Etanol</SelectItem>
                      <SelectItem value="Flex">Flex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineCapacity">Cilindrada do Motor</Label>
                  <Input
                    id="engineCapacity"
                    value={formData.engineCapacity}
                    onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                    placeholder="Ex: 2.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Responsável</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Data de Aquisição</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseValue">Valor de Aquisição (R$)</Label>
                  <Input
                    id="purchaseValue"
                    type="number"
                    step="0.01"
                    value={formData.purchaseValue}
                    onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observações sobre o veículo..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Salvar Alterações" : "Cadastrar Veículo"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
