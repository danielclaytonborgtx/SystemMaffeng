"use client"

import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Hash, DollarSign, Calendar, MapPin, FileText, Truck, Wrench, User, Building } from "lucide-react"
import { useEquipmentMovements } from "@/hooks/use-supabase"

interface EquipmentViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: any
  onClose: () => void
}

// Função para mapear status do banco de dados para exibição
const mapStatusFromDB = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponível'
    case 'in_use':
      return 'Em Uso'
    case 'maintenance':
      return 'Manutenção'
    default:
      return 'Disponível'
  }
}

// Função para obter cor do badge de status
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'in_use':
      return 'bg-blue-100 text-blue-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
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

export function EquipmentViewDialog({ open, onOpenChange, equipment, onClose }: EquipmentViewDialogProps) {
  const { data: movements, loading: movementsLoading } = useEquipmentMovements(equipment?.id)
  
  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Informações do Equipamento</DialogTitle>
          <DialogDescription>
            Visualize os dados completos do equipamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com Informações Básicas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <Package className="h-12 w-12 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{equipment.name}</h2>
                    <Badge className={getStatusBadgeColor(equipment.status)}>
                      {mapStatusFromDB(equipment.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span>Código: {equipment.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-green-600" />
                      <span>Categoria: {equipment.category}</span>
                    </div>
                    {equipment.assigned_to && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-600" />
                        <span>Responsável: {equipment.assigned_to}</span>
                      </div>
                    )}
                  </div>
                </div>
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
                {equipment.value && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Valor</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(equipment.value)}</p>
                    </div>
                  </div>
                )}
                {equipment.purchase_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Data de Compra</p>
                      <p className="text-sm text-muted-foreground">{formatDate(equipment.purchase_date)}</p>
                    </div>
                  </div>
                )}
                {equipment.supplier && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Fornecedor</p>
                      <p className="text-sm text-muted-foreground">{equipment.supplier}</p>
                    </div>
                  </div>
                )}
                {equipment.invoice_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Número da Nota Fiscal</p>
                      <p className="text-sm text-muted-foreground">{equipment.invoice_number}</p>
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
                {equipment.last_maintenance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Última Manutenção</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(equipment.last_maintenance).toLocaleDateString('pt-BR')} às {new Date(equipment.last_maintenance).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
                {equipment.next_maintenance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Próxima Manutenção</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(equipment.next_maintenance).toLocaleDateString('pt-BR')} às {new Date(equipment.next_maintenance).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          {equipment.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{equipment.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Data de Criação</p>
                  <p className="text-muted-foreground">
                    {new Date(equipment.created_at).toLocaleDateString('pt-BR')} às {new Date(equipment.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Última Atualização</p>
                  <p className="text-muted-foreground">
                    {new Date(equipment.updated_at).toLocaleDateString('pt-BR')} às {new Date(equipment.updated_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <p className="text-muted-foreground">Carregando histórico...</p>
              ) : movements && movements.length > 0 ? (
                <div className="space-y-3">
                  {movements.slice(0, 5).map((movement: any) => {
                    const created = new Date(movement.created_at)
                    
                    // Função para formatar data de devolução corretamente
                    const formatReturnDate = (dateString: string) => {
                      if (!dateString) return null
                      
                      // Se está no formato YYYY-MM-DD (dados antigos), usar horário padrão
                      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        const [year, month, day] = dateString.split('-')
                        // Para dados antigos, usar um horário padrão simples (17:00)
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 17, 0, 0)
                      }
                      // Se está no formato ISO completo (dados novos), usar diretamente
                      return new Date(dateString)
                    }
                    
                    const returned = formatReturnDate(movement.actual_return_date)

                    return (
                      <div key={movement.id} className="p-2 sm:p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        {/* Cabeçalho: Badge + Funcionário */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <Badge 
                              variant={movement.actual_return_date ? "outline" : "secondary"} 
                              className={`w-fit ${
                                movement.actual_return_date 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {movement.actual_return_date ? "Devolvido" : "Saída"}
                            </Badge>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-800">{movement.employee_name}</span>
                              <span className="text-xs text-gray-500">({movement.employee_code})</span>
                            </div>
                          </div>
                        </div>

                        {/* Corpo: datas em colunas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2 text-xs">
                          <div className="bg-orange-50 p-2 rounded border-l-4 border-orange-400">
                            <span className="font-medium text-orange-800">Saída:</span><br />
                            <span className="text-orange-700">
                              {created.toLocaleDateString('pt-BR')} às {created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {returned && (
                            <div className="bg-green-50 p-2 rounded border-l-4 border-green-400">
                              <span className="font-medium text-green-800">Devolução:</span><br />
                              <span className="text-green-700">
                                {returned.toLocaleDateString('pt-BR')} às {returned.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {movements.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">E mais {movements.length - 5} movimentações...</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
