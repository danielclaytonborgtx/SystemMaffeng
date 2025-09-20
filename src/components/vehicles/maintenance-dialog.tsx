"use client"

import { CardDescription } from "@/components/ui/card"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Wrench, Hash, DollarSign, FileText, Calendar, CheckSquare, Loader2 } from "lucide-react"
import { useVehicleMaintenances, useVehicleMaintenanceOperations, useVehicleOperations, useVehicleScheduledMaintenances, useVehicleScheduledMaintenanceOperations, useVehicleMaintenanceInfo } from "@/hooks"
import { Vehicle } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle | null
  onClose: () => void
  onSuccess?: () => void
}

const maintenanceTypes = [
  { id: "oleo", name: "Troca de Óleo", intervalKm: 5000 },
  { id: "filtros", name: "Troca de Filtros", intervalKm: 10000 },
  { id: "pneus", name: "Rodízio/Troca de Pneus", intervalKm: 20000 },
  { id: "freios", name: "Revisão de Freios", intervalKm: 15000 },
  { id: "correia", name: "Troca de Correia Dentada", intervalKm: 60000 },
  { id: "revisao", name: "Revisão Geral", intervalKm: 10000 },
]

export function MaintenanceDialog({ open, onOpenChange, vehicle, onClose, onSuccess }: MaintenanceDialogProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history" | "schedule">("new")
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    currentKm: "",
    cost: "",
    items: "",
    nextMaintenanceKm: "",
    observations: "",
  })

  const [scheduledMaintenances, setScheduledMaintenances] = useState(
    maintenanceTypes.map((type) => ({
      ...type,
      enabled: false,
      nextKm: vehicle ? (vehicle.current_km || 0) + type.intervalKm : type.intervalKm,
    })),
  )

  const { data: maintenanceHistory, loading: historyLoading, refetch: refetchHistory } = useVehicleMaintenances(vehicle?.id)
  const { createMaintenance, loading: createLoading } = useVehicleMaintenanceOperations()
  const { updateVehicle } = useVehicleOperations()
  const { data: existingScheduledMaintenances, loading: scheduledLoading, refetch: refetchScheduled } = useVehicleScheduledMaintenances(vehicle?.id)
  const { upsertScheduledMaintenances, loading: saveScheduledLoading } = useVehicleScheduledMaintenanceOperations()
  const maintenanceInfo = useVehicleMaintenanceInfo(vehicle)
  const { toast } = useToast()

  // Carregar manutenções programadas existentes
  useEffect(() => {
    if (existingScheduledMaintenances && existingScheduledMaintenances.length > 0) {
      const updatedScheduled = maintenanceTypes.map((type) => {
        const existing = existingScheduledMaintenances.find(
          (scheduled) => scheduled.maintenance_type === type.id
        )
        return {
          ...type,
          enabled: existing ? existing.is_active : false,
          nextKm: existing ? existing.next_maintenance_km : (vehicle ? (vehicle.current_km || 0) + type.intervalKm : type.intervalKm),
        }
      })
      setScheduledMaintenances(updatedScheduled)
    }
  }, [existingScheduledMaintenances, vehicle])

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
      const itemsArray = formData.items ? formData.items.split('\n').filter(item => item.trim()) : []
      
      const maintenanceData: any = {
        vehicle_id: vehicle.id,
        vehicle_plate: vehicle.plate,
        vehicle_model: vehicle.model,
        type: formData.type as 'preventiva' | 'corretiva' | 'preditiva',
        description: formData.description,
        current_km: Number(formData.currentKm),
        cost: Number(formData.cost),
        items: itemsArray,
      }

      // Só adicionar campos opcionais se tiverem valor
      if (formData.nextMaintenanceKm && formData.nextMaintenanceKm.trim()) {
        maintenanceData.next_maintenance_km = Number(formData.nextMaintenanceKm)
      }
      
      if (formData.observations && formData.observations.trim()) {
        maintenanceData.observations = formData.observations
      }

      await createMaintenance(maintenanceData)

      // Atualizar o veículo com a nova quilometragem e última manutenção
      const updateData: any = {
        current_km: Number(formData.currentKm),
        last_maintenance: new Date().toISOString(),
      }

      // Se foi especificada uma próxima manutenção, atualizar também
      if (formData.nextMaintenanceKm && formData.nextMaintenanceKm.trim()) {
        updateData.maintenance_km = Number(formData.nextMaintenanceKm)
      } else {
        // Se não foi especificada próxima manutenção, limpar o campo
        updateData.maintenance_km = null
      }

      await updateVehicle(vehicle.id, updateData)

      toast({
        title: "Sucesso",
        description: "Manutenção registrada com sucesso!"
      })

      // Limpar formulário
      setFormData({
        type: "",
        description: "",
        currentKm: "",
        cost: "",
        items: "",
        nextMaintenanceKm: "",
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
        description: "Erro ao registrar manutenção",
        variant: "destructive"
      })
    }
  }

  const handleScheduleToggle = (typeId: string, enabled: boolean) => {
    setScheduledMaintenances((prev) =>
      prev.map((item) => {
        if (item.id === typeId) {
          if (enabled) {
            // Se habilitando, calcular a próxima manutenção baseada no KM atual + intervalo
            const currentKm = vehicle?.current_km || 0
            const nextKm = currentKm + item.intervalKm
            return { ...item, enabled, nextKm }
          } else {
            return { ...item, enabled, nextKm: 0 }
          }
        }
        return item
      }),
    )
  }

  const handleSaveScheduledMaintenances = async () => {
    if (!vehicle?.id) {
      toast({
        title: "Erro",
        description: "Veículo não encontrado",
        variant: "destructive"
      })
      return
    }

    try {
      const enabledMaintenances = scheduledMaintenances.filter(m => m.enabled)
      
      if (enabledMaintenances.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma manutenção selecionada para programar",
          variant: "destructive"
        })
        return
      }

      const scheduledMaintenancesData = enabledMaintenances.map(maintenance => ({
        vehicle_id: vehicle.id,
        maintenance_type: maintenance.id,
        maintenance_name: maintenance.name,
        interval_km: maintenance.intervalKm,
        next_maintenance_km: maintenance.nextKm,
        is_active: true
      }))

      await upsertScheduledMaintenances(vehicle.id, scheduledMaintenancesData)

      toast({
        title: "Sucesso",
        description: "Manutenções programadas salvas com sucesso!"
      })

      // Recarregar dados
      refetchScheduled()
      
      // Chamar callback de sucesso se fornecido
      onSuccess?.()
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar manutenções programadas",
        variant: "destructive"
      })
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[95vw] sm:w-[95vw]">
        <DialogHeader>
          <DialogTitle>Manutenções - {vehicle.plate}</DialogTitle>
          <DialogDescription>{vehicle.model}</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status do Veículo
              <Badge
                variant={vehicle.status === "active" ? "secondary" : "outline"}
                className={
                  vehicle.status === "active"
                    ? "bg-green-100 text-green-800"
                    : vehicle.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {vehicle.status === "active" ? "Ativo" : vehicle.status === "maintenance" ? "Manutenção" : "Aposentado"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">KM Atual:</span>
                <div className="text-lg font-bold">{vehicle.current_km?.toLocaleString('pt-BR')} km</div>
              </div>
              <div>
                <span className="font-medium">Próxima Manutenção:</span>
                <div className="text-lg font-bold">
                  {maintenanceInfo.nextMaintenanceKm ? (
                    <span className={maintenanceInfo.isOverdue ? "text-red-600" : ""}>
                      {maintenanceInfo.nextMaintenanceKm.toLocaleString('pt-BR')} km
                    </span>
                  ) : (
                    "Não agendada"
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
              <div>
                <span className="font-medium">Última Manutenção:</span>
                <div className="text-lg font-bold">
                  {maintenanceHistory.length > 0 
                    ? new Date(maintenanceHistory[0].created_at).toLocaleDateString("pt-BR")
                    : vehicle.last_maintenance 
                      ? new Date(vehicle.last_maintenance).toLocaleDateString("pt-BR")
                      : "N/A"
                  }
                </div>
              </div>
              <div>
                <span className="font-medium">Responsável:</span>
                <div className="text-lg font-bold">{vehicle.assigned_to || "Não atribuído"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 border-b">
          <Button
            variant={activeTab === "new" ? "default" : "ghost"}
            onClick={() => setActiveTab("new")}
            className="rounded-b-none cursor-pointer text-xs sm:text-sm"
          >
            Nova Manutenção
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="rounded-b-none cursor-pointer text-xs sm:text-sm"
          >
            Histórico
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            onClick={() => setActiveTab("schedule")}
            className="rounded-b-none cursor-pointer text-xs sm:text-sm"
          >
            Programar
          </Button>
        </div>

        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Manutenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      Tipo de Manutenção
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                        <SelectItem value="preditiva">Preditiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentKm" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-green-600" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    Descrição da Manutenção
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os serviços realizados..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Custo Total (R$)
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
                    <Label htmlFor="nextMaintenanceKm" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Próxima Manutenção (KM)
                    </Label>
                    <Input
                      id="nextMaintenanceKm"
                      type="number"
                      value={formData.nextMaintenanceKm}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceKm: e.target.value })}
                      placeholder="Ex: 50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="items" className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-yellow-600" />
                    Itens Substituídos/Utilizados
                  </Label>
                  <Textarea
                    id="items"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    placeholder="Liste os itens utilizados na manutenção (um por linha)..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observações adicionais..."
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
                  "Registrar Manutenção"
                )}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando histórico...</span>
                </div>
              ) : maintenanceHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma manutenção registrada para este veículo
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>KM</TableHead>
                          <TableHead>Custo</TableHead>
                          <TableHead>Itens</TableHead>
                          <TableHead>Próxima KM</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenanceHistory.map((maintenance) => (
                          <TableRow key={maintenance.id}>
                            <TableCell>{new Date(maintenance.created_at).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>
                              <Badge
                                variant={maintenance.type === "preventiva" ? "secondary" : "outline"}
                                className={
                                  maintenance.type === "preventiva"
                                    ? "bg-green-100 text-green-800"
                                    : maintenance.type === "corretiva"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {maintenance.type.charAt(0).toUpperCase() + maintenance.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={maintenance.description}>
                                {maintenance.description}
                              </div>
                            </TableCell>
                            <TableCell>{maintenance.current_km.toLocaleString('pt-BR')} km</TableCell>
                            <TableCell>R$ {maintenance.cost.toFixed(2)}</TableCell>
                            <TableCell className="max-w-xs">
                              {maintenance.items && maintenance.items.length > 0 ? (
                                <div className="text-sm">
                                  {maintenance.items.slice(0, 2).map((item: string, index: number) => (
                                    <div key={index} className="truncate" title={item}>
                                      • {item}
                                    </div>
                                  ))}
                                  {maintenance.items.length > 2 && (
                                    <div className="text-muted-foreground">
                                      +{maintenance.items.length - 2} mais
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {maintenance.next_maintenance_km ? (
                                <span className="font-medium">
                                  {maintenance.next_maintenance_km.toLocaleString('pt-BR')} km
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {maintenance.observations ? (
                                <div className="truncate text-sm" title={maintenance.observations}>
                                  {maintenance.observations}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {maintenanceHistory.map((maintenance) => (
                      <Card key={maintenance.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{new Date(maintenance.created_at).toLocaleDateString("pt-BR")}</div>
                              <div className="text-xs text-muted-foreground mt-1 truncate">{maintenance.description}</div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <Badge
                                variant={maintenance.type === "preventiva" ? "secondary" : "outline"}
                                className={
                                  maintenance.type === "preventiva"
                                    ? "bg-green-100 text-green-800"
                                    : maintenance.type === "corretiva"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {maintenance.type.charAt(0).toUpperCase() + maintenance.type.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">KM:</span>
                              <div className="font-medium">{maintenance.current_km.toLocaleString('pt-BR')} km</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Custo:</span>
                              <div className="font-medium">R$ {maintenance.cost.toFixed(2)}</div>
                            </div>
                            {maintenance.next_maintenance_km && (
                              <div>
                                <span className="text-muted-foreground">Próxima KM:</span>
                                <div className="font-medium">{maintenance.next_maintenance_km.toLocaleString('pt-BR')} km</div>
                              </div>
                            )}
                          </div>

                          {maintenance.items && maintenance.items.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Itens utilizados:</span>
                              <div className="mt-1 space-y-1">
                                {maintenance.items.slice(0, 3).map((item: string, index: number) => (
                                  <div key={index} className="text-foreground">• {item}</div>
                                ))}
                                {maintenance.items.length > 3 && (
                                  <div className="text-muted-foreground">+{maintenance.items.length - 3} mais itens</div>
                                )}
                              </div>
                            </div>
                          )}

                          {maintenance.observations && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Observações:</span>
                              <div className="mt-1 text-foreground">{maintenance.observations}</div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "schedule" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Programar Manutenções Preventivas
              </CardTitle>
              <CardDescription>
                Configure os intervalos de manutenção preventiva para este veículo. 
                As manutenções serão automaticamente agendadas baseadas na quilometragem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando programações...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {scheduledMaintenances.map((maintenance) => (
                      <div key={maintenance.id} className="group relative">
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 transition-all duration-200 ${
                          maintenance.enabled 
                            ? 'border-blue-200 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={maintenance.enabled}
                              onCheckedChange={(checked) => handleScheduleToggle(maintenance.id, !!checked)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{maintenance.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Intervalo: {maintenance.intervalKm.toLocaleString('pt-BR')} km
                              </div>
                            </div>
                          </div>
                          {maintenance.enabled && (
                            <div className="text-left sm:text-right">
                              <div className="text-xs font-medium text-gray-600">Próxima manutenção:</div>
                              <div className="text-sm font-bold text-blue-600">
                                {maintenance.nextKm.toLocaleString('pt-BR')} km
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {vehicle && vehicle.current_km ? (
                                  `Faltam ${(maintenance.nextKm - vehicle.current_km).toLocaleString('pt-BR')} km`
                                ) : (
                                  'KM atual não informado'
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Como funciona:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• As manutenções são agendadas automaticamente baseadas na quilometragem</li>
                          <li>• Você receberá alertas quando a manutenção estiver próxima</li>
                          <li>• Após realizar a manutenção, a próxima será automaticamente recalculada</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onClose} 
                      className="cursor-pointer"
                      disabled={saveScheduledLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveScheduledMaintenances}
                      className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                      disabled={saveScheduledLoading}
                    >
                      {saveScheduledLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Programação"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
