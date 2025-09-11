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
import { useVehicleOperations } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { Car, Hash, Calendar, MapPin, FileText, DollarSign, Wrench, Fuel, User, AlertTriangle } from "lucide-react"

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
  onSuccess?: () => void
}

// Função para mapear status do formulário para o banco de dados
const mapStatusToDB = (status: string): 'active' | 'maintenance' | 'retired' => {
  switch (status) {
    case 'Ativo':
      return 'active'
    case 'Manutenção':
      return 'maintenance'
    case 'Inativo':
      return 'retired'
    default:
      return 'active'
  }
}

// Função para mapear status do banco de dados para o formulário
const mapStatusFromDB = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Ativo'
    case 'maintenance':
      return 'Manutenção'
    case 'retired':
      return 'Inativo'
    default:
      return 'Ativo'
  }
}

export function VehicleDialog({ open, onOpenChange, vehicle, onClose, onSuccess }: VehicleDialogProps) {
  const { createVehicle, updateVehicle, deleteVehicle, loading } = useVehicleOperations()
  const { toast } = useToast()
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
        type: vehicle.brand || "",
        year: vehicle.year?.toString() || "",
        currentKm: vehicle.currentKm?.toString() || "",
        chassisNumber: vehicle.chassisNumber || "",
        renavam: vehicle.renavam || "",
        color: vehicle.color || "",
        fuelType: vehicle.fuelType || "",
        engineCapacity: vehicle.engineCapacity || "",
        assignedTo: vehicle.assignedTo || "",
        status: mapStatusFromDB(vehicle.status) || "Ativo",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Criar objeto base com campos obrigatórios
      const vehicleData: any = {
        plate: formData.plate,
        model: formData.model,
        brand: formData.type,
        year: parseInt(formData.year),
        status: mapStatusToDB(formData.status),
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.currentKm) {
        vehicleData.currentKm = parseInt(formData.currentKm)
      }
      if (formData.chassisNumber) {
        vehicleData.chassisNumber = formData.chassisNumber
      }
      if (formData.renavam) {
        vehicleData.renavam = formData.renavam
      }
      if (formData.color) {
        vehicleData.color = formData.color
      }
      if (formData.fuelType) {
        vehicleData.fuelType = formData.fuelType
      }
      if (formData.engineCapacity) {
        vehicleData.engineCapacity = formData.engineCapacity
      }
      if (formData.assignedTo) {
        vehicleData.assignedTo = formData.assignedTo
      }
      if (formData.purchaseDate) {
        vehicleData.purchaseDate = formData.purchaseDate
      }
      if (formData.purchaseValue) {
        vehicleData.purchaseValue = parseFloat(formData.purchaseValue)
      }
      if (formData.insuranceExpiry) {
        vehicleData.insuranceExpiry = formData.insuranceExpiry
      }
      if (formData.licenseExpiry) {
        vehicleData.licenseExpiry = formData.licenseExpiry
      }
      if (formData.observations) {
        vehicleData.observations = formData.observations
      }

      if (vehicle) {
        // Atualizar veículo existente
        await updateVehicle(vehicle.id, vehicleData)
        toast({
          title: "Sucesso",
          description: "Veículo atualizado com sucesso!",
        })
      } else {
        // Criar novo veículo
        await createVehicle(vehicleData)
        toast({
          title: "Sucesso",
          description: "Veículo criado com sucesso!",
        })
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar veículo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!vehicle?.id) return

    try {
      await deleteVehicle(vehicle.id)
      toast({
        title: "Sucesso",
        description: "Veículo excluído com sucesso!",
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir veículo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isEditing = !!vehicle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto mx-2">
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
                  <div className="text-lg font-bold">{vehicle.currentKm?.toLocaleString('pt-BR')} km</div>
                </div>
                <div>
                  <span className="font-medium">Próxima Manutenção:</span>
                  <div className="text-lg font-bold">{vehicle.maintenanceKm?.toLocaleString('pt-BR')} km</div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plate" className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-blue-600" />
                      Placa
                    </Label>
                    <Input
                      id="plate"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Modelo
                    </Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ex: Volvo FH 540"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-yellow-600" />
                      Tipo
                    </Label>
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
                    <Label htmlFor="year" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Ano
                    </Label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color" className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-yellow-600" />
                      Cor
                    </Label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex justify-between gap-2">
            {isEditing && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                className="cursor-pointer" 
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Excluir Veículo"}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700" disabled={loading}>
                {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Veículo")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
