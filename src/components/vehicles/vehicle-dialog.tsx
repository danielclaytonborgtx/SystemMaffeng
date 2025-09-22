"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmployeeAutocomplete } from "@/components/ui/employee-autocomplete"
import { useVehicleOperations, useEmployees, useVehicleMaintenanceInfo } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { Car, Hash, Calendar, MapPin, FileText, DollarSign, Wrench, Fuel, User, AlertTriangle, Shield, AlertCircle } from "lucide-react"

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
  const { data: employees } = useEmployees()
  const maintenanceInfo = useVehicleMaintenanceInfo(vehicle)
  const { toast } = useToast()
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
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
        currentKm: vehicle.current_km?.toString() || "",
        chassisNumber: vehicle.chassis_number || "",
        renavam: vehicle.renavam || "",
        color: vehicle.color || "",
        fuelType: vehicle.fuel_type || "",
        engineCapacity: vehicle.engine_capacity || "",
        assignedTo: vehicle.assigned_to || "",
        status: mapStatusFromDB(vehicle.status) || "Ativo",
        purchaseDate: vehicle.purchase_date || "",
        purchaseValue: vehicle.purchase_value?.toString() || "",
        insuranceExpiry: vehicle.insurance_expiry || "",
        licenseExpiry: vehicle.license_expiry || "",
        observations: vehicle.observations || "",
      })
      
      // Configurar colaborador selecionado se houver um assigned_to
      if (vehicle.assigned_to && employees) {
        const employee = employees.find(emp => emp.name === vehicle.assigned_to)
        if (employee) {
          setSelectedEmployee(employee)
        }
      }
    } else {
      // Resetar formulário para novo veículo
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
      setSelectedEmployee(null) // Limpar colaborador selecionado
    }
  }, [vehicle, open, employees]) // Adicionar 'employees' para configurar colaborador quando carregar

  // Função para verificar se uma data está vencida
  const isDateExpired = (dateString: string): boolean => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparar apenas a data
    return date < today
  }

  // Função para calcular dias até o vencimento
  const getDaysUntilExpiry = (dateString: string): number => {
    if (!dateString) return 0
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

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
        vehicleData.current_km = parseInt(formData.currentKm)
      }
      if (formData.chassisNumber) {
        vehicleData.chassis_number = formData.chassisNumber
      }
      if (formData.renavam) {
        vehicleData.renavam = formData.renavam
      }
      if (formData.color) {
        vehicleData.color = formData.color
      }
      if (formData.fuelType) {
        vehicleData.fuel_type = formData.fuelType
      }
      if (formData.engineCapacity) {
        vehicleData.engine_capacity = formData.engineCapacity
      }
      if (selectedEmployee) {
        vehicleData.assigned_to = selectedEmployee.id
      }
      if (formData.purchaseDate) {
        vehicleData.purchase_date = formData.purchaseDate
      }
      if (formData.purchaseValue) {
        vehicleData.purchase_value = parseFloat(formData.purchaseValue)
      }
      if (formData.insuranceExpiry) {
        vehicleData.insurance_expiry = formData.insuranceExpiry
      }
      if (formData.licenseExpiry) {
        vehicleData.license_expiry = formData.licenseExpiry
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
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar veículo. Tente novamente."
      toast({
        title: "Erro",
        description: errorMessage,
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
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden mx-auto p-2 sm:max-w-[90vw] sm:w-[90vw] sm:max-h-[90vh] sm:mx-0 sm:p-6 md:max-w-[80vw] md:w-[80vw] lg:max-w-[70vw] lg:w-[70vw]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalhes do Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Visualize e edite as informações do veículo" : "Cadastre um novo veículo na frota"}
          </DialogDescription>
        </DialogHeader>

        {isEditing && vehicle && (
          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl font-bold truncate">{vehicle.plate}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{vehicle.model} - {vehicle.brand}</div>
                  </div>
                </div>
                <Badge
                  variant={vehicle.status === "active" ? "secondary" : "outline"}
                  className={`self-start sm:self-auto ${
                    vehicle.status === "active"
                      ? "bg-green-100 text-green-800"
                      : vehicle.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {mapStatusFromDB(vehicle.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hash className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">KM Atual</span>
                    <div className="text-lg font-bold">
                      {vehicle.current_km ? vehicle.current_km.toLocaleString('pt-BR') + ' km' : 'Não informado'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Próxima Manutenção</span>
                    <div className="text-lg font-bold">
                      {maintenanceInfo.nextMaintenanceKm ? (
                        <span className={maintenanceInfo.isOverdue ? "text-red-600" : ""}>
                          {maintenanceInfo.nextMaintenanceKm.toLocaleString('pt-BR')} km
                        </span>
                      ) : (
                        'Não agendada'
                      )}
                    </div>
                    {maintenanceInfo.nextMaintenanceType && (
                      <div className="text-xs text-gray-500 mt-1">
                        {maintenanceInfo.nextMaintenanceType}
                      </div>
                    )}
                    {maintenanceInfo.kmRemaining !== null && (
                      <div className={`text-xs mt-1 ${
                        maintenanceInfo.isOverdue 
                          ? "text-red-500 font-medium" 
                          : maintenanceInfo.kmRemaining <= 1000 
                            ? "text-yellow-600 font-medium" 
                            : "text-gray-500"
                      }`}>
                        {maintenanceInfo.isOverdue 
                          ? `Vencida há ${Math.abs(maintenanceInfo.kmRemaining).toLocaleString('pt-BR')} km`
                          : `Faltam ${maintenanceInfo.kmRemaining.toLocaleString('pt-BR')} km`
                        }
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Fuel className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Combustível</span>
                    <div className="text-lg font-bold">
                      {vehicle.fuel_type || 'Não informado'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Responsável</span>
                    <div className="text-lg font-bold">
                      {vehicle.assigned_to || "Não atribuído"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-3 sm:px-6">
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
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Documentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-3 sm:px-6">
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
                    <Label htmlFor="insuranceExpiry" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Vencimento do Seguro
                      </div>
                      {isDateExpired(formData.insuranceExpiry) && (
                        <Badge variant="destructive" className="w-fit">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Vencido
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      className={isDateExpired(formData.insuranceExpiry) ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {isDateExpired(formData.insuranceExpiry) && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Seguro vencido há {Math.abs(getDaysUntilExpiry(formData.insuranceExpiry))} dias
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Vencimento do Licenciamento
                      </div>
                      {isDateExpired(formData.licenseExpiry) && (
                        <Badge variant="destructive" className="w-fit">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Vencido
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      className={isDateExpired(formData.licenseExpiry) ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {isDateExpired(formData.licenseExpiry) && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Licenciamento vencido há {Math.abs(getDaysUntilExpiry(formData.licenseExpiry))} dias
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Informações Técnicas e Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <EmployeeAutocomplete
                    label="Responsável"
                    placeholder="Digite o nome ou código do colaborador..."
                    value={selectedEmployee?.id || ""}
                    onChange={setSelectedEmployee}
                    employees={employees || []}
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

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 px-3 sm:px-0">
            {isEditing && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                className="cursor-pointer w-full sm:w-auto order-2 sm:order-1" 
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Excluir Veículo"}
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer w-full sm:w-auto" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700 w-full sm:w-auto" disabled={loading}>
                {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Veículo")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

