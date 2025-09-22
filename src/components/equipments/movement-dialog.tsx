"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { EmployeeAutocomplete } from "@/components/ui/employee-autocomplete"
import { useEquipmentMovementOperations, useEmployees, useEquipmentOperations, useEquipmentMovements } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { User, Hash, Calendar, MapPin, FileText, CheckSquare } from "lucide-react"

interface MovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: any
  onClose: () => void
  onSuccess?: () => void
}

export function MovementDialog({ open, onOpenChange, equipment, onClose, onSuccess }: MovementDialogProps) {
  const { createMovement, updateMovement, loading } = useEquipmentMovementOperations()
  const { updateEquipment } = useEquipmentOperations()
  const { data: employees } = useEmployees()
  const { data: movements, loading: movementsLoading } = useEquipmentMovements(equipment?.id)
  const { toast } = useToast()
  
  // Debug: log das movimentações quando mudam
  console.log("Movimentações carregadas para equipamento:", equipment?.id, movements)
  const [movementType, setMovementType] = useState<"saida" | "devolucao">("saida")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [formData, setFormData] = useState({
    project: "",
    expectedReturn: "",
    observations: "",
  })

  const [checklistItems, setChecklistItems] = useState([
    { id: 1, item: "Equipamento em bom estado", checked: false },
    { id: 2, item: "Todos os acessórios incluídos", checked: false },
    { id: 3, item: "Manual de instruções presente", checked: false },
    { id: 4, item: "Equipamento limpo", checked: false },
    { id: 5, item: "Sem danos visíveis", checked: false },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!equipment?.id) return

    try {
      console.log("Iniciando movimentação:", { isReturn, equipment: equipment.id, formData })
      
      let responsibleEmployee: any = null
      let lastOutMovement: any = null
      
      // Para saídas, validar colaborador
      if (!isReturn) {
        if (!selectedEmployee) {
          toast({
            title: "Erro",
            description: "Selecione um colaborador para registrar a saída.",
            variant: "destructive",
          })
          return
        }
        responsibleEmployee = selectedEmployee
      } else {
        // Para devoluções, buscar o colaborador que está usando o equipamento
        console.log("Equipamento para devolução:", equipment)
        console.log("Movimentações do equipamento:", movements)
        
        // Buscar a movimentação de saída que ainda não foi devolvida
        lastOutMovement = movements?.find(mov => mov.type === 'out' && !mov.actual_return_date)
        
        console.log("Movimentações encontradas:", movements?.length || 0)
        console.log("Movimentação ativa encontrada:", lastOutMovement)
        
        if (lastOutMovement) {
          responsibleEmployee = {
            id: lastOutMovement.employee_id,
            name: lastOutMovement.employee_name,
            code: lastOutMovement.employee_code
          }
          console.log("Colaborador encontrado na movimentação:", responsibleEmployee)
        } else {
          // Fallback: usar dados do assigned_to do equipamento
          responsibleEmployee = {
            id: equipment.assigned_to || "unknown",
            name: equipment.assigned_to || "Colaborador",
            code: "DEV001"
          }
          console.log("Usando fallback para colaborador:", responsibleEmployee)
        }
      }

      const movementData: any = {
        equipment_id: equipment.id,
        equipment_name: equipment.name,
        equipment_code: equipment.code,
        employee_id: responsibleEmployee.id!,
        employee_name: responsibleEmployee.name,
        employee_code: responsibleEmployee.code,
        type: isReturn ? 'return' as const : 'out' as const,
        project: formData.project,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.expectedReturn) {
        movementData.expected_return_date = formData.expectedReturn
      }
      
      if (isReturn) {
        movementData.actual_return_date = new Date().toISOString().split('T')[0]
      }
      
      if (formData.observations) {
        movementData.observations = formData.observations
      }
      
      if (isReturn) {
        movementData.checklist = {
          equipment_good_condition: checklistItems[0].checked,
          accessories_included: checklistItems[1].checked,
          manual_present: checklistItems[2].checked,
          equipment_clean: checklistItems[3].checked,
          no_visible_damage: checklistItems[4].checked,
        }
      }

      console.log("Dados da movimentação:", movementData)
      
      if (isReturn) {
        if (lastOutMovement) {
          // Para devoluções, atualizar a movimentação existente
          console.log("Atualizando movimentação existente:", lastOutMovement.id)
          console.log("Movimentação antes da atualização:", lastOutMovement)
          
          const updateData: any = {
            actual_return_date: new Date().toISOString().split('T')[0],
            checklist: {
              equipment_good_condition: checklistItems[0].checked,
              accessories_included: checklistItems[1].checked,
              manual_present: checklistItems[2].checked,
              equipment_clean: checklistItems[3].checked,
              no_visible_damage: checklistItems[4].checked,
            }
          }
          
          // Adicionar observações apenas se tiverem valor
          if (formData.observations) {
            updateData.observations = formData.observations
          }
          
          console.log("Dados para atualização:", updateData)
          await updateMovement(lastOutMovement.id!, updateData)
          console.log("Movimentação atualizada com sucesso")
        } else {
          // Fallback: criar nova movimentação de devolução se não encontrar a original
          console.log("Não encontrou movimentação original, criando nova de devolução")
          const returnMovementData = {
            ...movementData,
            type: 'return',
            actual_return_date: new Date().toISOString().split('T')[0],
          }
          await createMovement(returnMovementData)
          console.log("Movimentação de devolução criada com sucesso")
        }
      } else {
        // Para saídas, criar nova movimentação
        console.log("Criando nova movimentação de saída")
        await createMovement(movementData)
        console.log("Movimentação criada com sucesso")
      }
      
      // Atualizar o status do equipamento
      const newStatus = isReturn ? 'available' : 'in_use'
      
      console.log("Atualizando equipamento:", { id: equipment.id, status: newStatus, isReturn, project: formData.project })
      
      // Preparar dados de atualização
      const updateData: any = {
        status: newStatus
      }
      
      // Para saídas, adicionar assigned_to e atualizar localização
      if (!isReturn) {
        updateData.assigned_to = responsibleEmployee.id
        // Mapear projeto para localização
        const projectLocationMap: { [key: string]: string } = {
          'obra-central': 'Obra Central',
          'obra-norte': 'Obra Norte', 
          'obra-sul': 'Obra Sul',
          'manutencao': 'Manutenção'
        }
        updateData.location = projectLocationMap[formData.project] || "Obra"
      } else {
        // Para devoluções, voltar para almoxarifado e limpar responsável
        updateData.location = "Almoxarifado"
        updateData.assigned_to = null // Limpar o responsável
      }
      
      await updateEquipment(equipment.id, updateData)
      console.log("Equipamento atualizado com sucesso")
      
      toast({
        title: "Sucesso",
        description: isReturn ? "Devolução registrada com sucesso!" : "Saída registrada com sucesso!",
      })
      
      console.log("Chamando onSuccess para atualizar listas")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Erro detalhado:", error)
      toast({
        title: "Erro",
        description: `Erro ao registrar movimentação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      })
    }
  }

  const handleChecklistChange = (id: number, checked: boolean) => {
    setChecklistItems((items) => items.map((item) => (item.id === id ? { ...item, checked } : item)))
  }

  if (!equipment) return null

  const isReturn = equipment.status === "in_use"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Movimentação de Equipamento</DialogTitle>
          <DialogDescription>
            {equipment.name} - {equipment.code}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status Atual
              <Badge variant={equipment.status === "available" ? "secondary" : "outline"}>
                {equipment.status === "available" ? "Disponível" : 
                 equipment.status === "in_use" ? "Em Uso" : 
                 equipment.status === "maintenance" ? "Manutenção" : equipment.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.assigned_to && (() => {
              const assignedEmployee = employees?.find(emp => emp.id === equipment.assigned_to)
              return (
                <p className="text-sm text-muted-foreground">
                  Atualmente com: <span className="font-medium">{assignedEmployee?.name || equipment.assigned_to}</span>
                  {assignedEmployee?.code && (
                    <span className="text-xs ml-1">({assignedEmployee.code})</span>
                  )}
                </p>
              )
            })()}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isReturn ? (
            // Formulário de Saída
            <Card>
              <CardHeader>
                <CardTitle>Registrar Saída</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <EmployeeAutocomplete
                    label="Colaborador Responsável"
                    placeholder="Digite o nome ou código do colaborador..."
                    value={selectedEmployee?.id || ""}
                    onChange={setSelectedEmployee}
                    employees={employees || []}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-600" />
                      Localização
                    </Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="almoxarifado">Almoxarifado</SelectItem>
                        <SelectItem value="obra">Obra</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Previsão de Devolução
                    </Label>
                    <Input
                      id="expectedReturn"
                      type="date"
                      value={formData.expectedReturn}
                      onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Observações
                  </Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observações sobre a saída do equipamento..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            // Formulário de Devolução com Checklist
            <Card>
              <CardHeader>
                <CardTitle>Registrar Devolução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    Checklist de Devolução
                  </Label>
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`checklist-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                        />
                        <Label htmlFor={`checklist-${item.id}`} className="text-sm">
                          {item.item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnObservations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Observações da Devolução
                  </Label>
                  <Textarea
                    id="returnObservations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Descreva o estado do equipamento na devolução..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700" disabled={loading}>
              {loading ? "Registrando..." : (isReturn ? "Registrar Devolução" : "Registrar Saída")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
