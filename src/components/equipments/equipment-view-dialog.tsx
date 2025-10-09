"use client"

import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Hash, DollarSign, Calendar, MapPin, FileText, Truck, Wrench, User, Building, CheckCircle, XCircle } from "lucide-react"
import { useEquipmentMovements } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"

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

// Função para formatar checklist de devolução
const formatChecklist = (checklist: any) => {
  if (!checklist) return null
  
  const checklistItems = [
    { key: 'equipment_good_condition', label: 'Equipamento em bom estado' },
    { key: 'accessories_included', label: 'Todos os acessórios incluídos' },
    { key: 'manual_present', label: 'Manual de instruções presente' },
    { key: 'equipment_clean', label: 'Equipamento limpo' },
    { key: 'no_visible_damage', label: 'Sem danos visíveis' }
  ]
  
  return checklistItems.map(item => ({
    label: item.label,
    checked: checklist[item.key] || false
  }))
}

export function EquipmentViewDialog({ open, onOpenChange, equipment, onClose }: EquipmentViewDialogProps) {
  const { data: movements, loading: movementsLoading } = useEquipmentMovements(equipment?.id)
  
  // Função para baixar arquivo do Supabase Storage
  const handleDownloadFile = async (filePath: string) => {
    try {
      console.log('Iniciando download do arquivo:', filePath)
      
      // Primeiro, vamos listar os arquivos para ver a estrutura
      const { data: files, error: listError } = await supabase.storage
        .from('equipment-invoices')
        .list('', {
          limit: 100,
          offset: 0
        })
      
      if (listError) {
        console.error('Erro ao listar arquivos:', listError)
        alert('Erro ao acessar arquivos: ' + listError.message)
        return
      }
      
      console.log('Arquivos encontrados:', files)
      
      // Procurar o arquivo na lista
      const targetFile = files?.find(file => file.name === filePath)
      
      if (!targetFile) {
        console.error('Arquivo não encontrado:', filePath)
        alert('Arquivo não encontrado no servidor')
        return
      }
      
      console.log('Arquivo encontrado:', targetFile)
      
      // Baixar arquivo do Supabase Storage
      const { data, error } = await supabase.storage
        .from('equipment-invoices')
        .download(filePath)
      
      if (error) {
        console.error('Erro ao baixar arquivo:', error)
        alert('Erro ao baixar arquivo: ' + error.message)
        return
      }
      
      // Criar URL para download
      const url = URL.createObjectURL(data)
      
      // Criar link temporário para download
      const link = document.createElement('a')
      link.href = url
      link.download = filePath.split('/').pop() || 'arquivo'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL
      URL.revokeObjectURL(url)
      
      console.log('Arquivo baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao processar download:', error)
      alert('Erro ao baixar arquivo')
    }
  }
  
  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Informações do Equipamento</DialogTitle>
          <DialogDescription className="text-sm">
            Visualize os dados completos do equipamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Header com Informações Básicas */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto sm:mx-0">
                  <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold">{equipment.name}</h2>
                    <Badge className={getStatusBadgeColor(equipment.status)}>
                      {mapStatusFromDB(equipment.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-muted-foreground">
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
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                {equipment.invoice_file && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Arquivo da Nota Fiscal</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <p className="text-sm text-muted-foreground break-all">{equipment.invoice_file}</p>
                        <button
                          onClick={() => handleDownloadFile(equipment.invoice_file)}
                          className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors w-fit"
                        >
                          <FileText className="h-3 w-3" />
                          Baixar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manutenção */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                Informações de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <p className="text-sm text-muted-foreground">{equipment.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="text-base sm:text-lg">Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
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
                    const checklistData = formatChecklist(movement.checklist)

                    return (
                      <div key={movement.id} className="p-2 sm:p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                        {/* Cabeçalho: Badge + Funcionário */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <Badge 
                              variant={movement.actual_return_date ? "outline" : "secondary"} 
                              className={`w-fit ${
                                movement.actual_return_date 
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800" 
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {movement.actual_return_date ? "Devolvido" : "Saída"}
                            </Badge>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{movement.employee_name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({movement.employee_code})</span>
                            </div>
                          </div>
                        </div>

                        {/* Corpo: datas em colunas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2 text-xs">
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border-l-4 border-orange-400 dark:border-orange-600">
                            <span className="font-medium text-orange-800 dark:text-orange-400">Saída:</span><br />
                            <span className="text-orange-700 dark:text-orange-300">
                              {new Date(created.getTime() - created.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')} às {created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {movement.expected_return_date && !returned ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-4 border-blue-400 dark:border-blue-600">
                              <span className="font-medium text-blue-800 dark:text-blue-400">Previsão de Devolução:</span><br />
                              <span className="text-blue-700 dark:text-blue-300">
                                {new Date(movement.expected_return_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ) : returned ? (
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-4 border-green-400 dark:border-green-600">
                              <span className="font-medium text-green-800 dark:text-green-400">Devolução:</span><br />
                              <span className="text-green-700 dark:text-green-300">
                                {returned.toLocaleDateString('pt-BR')} às {returned.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* Checklist de Devolução */}
                        {returned && checklistData && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400 dark:border-blue-600">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-800 dark:text-blue-400 text-sm">Checklist de Devolução:</span>
                            </div>
                            <div className="space-y-1">
                              {checklistData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {item.checked ? (
                                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  )}
                                  <span className={item.checked ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observações */}
                        {movement.observations && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400 dark:border-yellow-600">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                              <span className="font-medium text-yellow-800 dark:text-yellow-400 text-xs">Observações:</span>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">{movement.observations}</p>
                          </div>
                        )}
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
