"use client"

import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Hash, Calendar, MapPin, FileText, DollarSign, Wrench, Fuel, User, AlertTriangle, Shield, AlertCircle } from "lucide-react"

interface VehicleViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
}

// Função para mapear status do banco de dados para exibição
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

// Função para obter cor do badge de status
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'retired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Função para formatar moeda
const formatCurrency = (value: number | null) => {
  if (!value) return 'Não informado'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não informado'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export function VehicleViewDialog({ open, onOpenChange, vehicle, onClose }: VehicleViewDialogProps) {
  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Informações do Veículo</DialogTitle>
          <DialogDescription>
            Visualize os dados completos do veículo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com Informações Básicas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <Car className="h-12 w-12 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{vehicle.model}</h2>
                    <Badge className={getStatusBadgeColor(vehicle.status)}>
                      {mapStatusFromDB(vehicle.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span>Placa: {vehicle.plate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-green-600" />
                      <span>Marca: {vehicle.brand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Ano: {vehicle.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span>KM Atual: {vehicle.current_km?.toLocaleString("pt-BR") || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Informações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.chassis_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Número do Chassi</p>
                      <p className="text-sm text-muted-foreground">{vehicle.chassis_number}</p>
                    </div>
                  </div>
                )}
                {vehicle.renavam && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">RENAVAM</p>
                      <p className="text-sm text-muted-foreground">{vehicle.renavam}</p>
                    </div>
                  </div>
                )}
                {vehicle.color && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Cor</p>
                      <p className="text-sm text-muted-foreground">{vehicle.color}</p>
                    </div>
                  </div>
                )}
                {vehicle.engine_capacity && (
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Cilindrada</p>
                      <p className="text-sm text-muted-foreground">{vehicle.engine_capacity}</p>
                    </div>
                  </div>
                )}
                {vehicle.fuel_type && (
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Tipo de Combustível</p>
                      <p className="text-sm text-muted-foreground">{vehicle.fuel_type}</p>
                    </div>
                  </div>
                )}
                {vehicle.assigned_to && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Responsável</p>
                      <p className="text-sm text-muted-foreground">{vehicle.assigned_to}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.purchase_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Data de Compra</p>
                      <p className="text-sm text-muted-foreground">{formatDate(vehicle.purchase_date)}</p>
                    </div>
                  </div>
                )}
                {vehicle.purchase_value && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Valor de Compra</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(vehicle.purchase_value)}</p>
                    </div>
                  </div>
                )}
                {vehicle.insurance_expiry && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Vencimento do Seguro</p>
                      <p className="text-sm text-muted-foreground">{formatDate(vehicle.insurance_expiry)}</p>
                    </div>
                  </div>
                )}
                {vehicle.license_expiry && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Vencimento da Licença</p>
                      <p className="text-sm text-muted-foreground">{formatDate(vehicle.license_expiry)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-yellow-600" />
                Informações de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.maintenance_km && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Próxima Manutenção</p>
                      <p className="text-sm text-muted-foreground">{vehicle.maintenance_km.toLocaleString("pt-BR")} km</p>
                    </div>
                  </div>
                )}
                {vehicle.last_maintenance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Última Manutenção</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vehicle.last_maintenance).toLocaleDateString('pt-BR')} às {new Date(vehicle.last_maintenance).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
                {vehicle.next_maintenance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Próxima Manutenção</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vehicle.next_maintenance).toLocaleDateString('pt-BR')} às {new Date(vehicle.next_maintenance).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {vehicle.observations && (
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Observações
              </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{vehicle.observations}</p>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Data de Criação</p>
                  <p className="text-muted-foreground">
                    {new Date(vehicle.created_at).toLocaleDateString('pt-BR')} às {new Date(vehicle.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Última Atualização</p>
                  <p className="text-muted-foreground">
                    {new Date(vehicle.updated_at).toLocaleDateString('pt-BR')} às {new Date(vehicle.updated_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
