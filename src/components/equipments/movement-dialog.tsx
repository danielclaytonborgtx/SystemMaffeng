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
import { useEquipmentMovementOperations, useEmployees, useEquipmentOperations, useEquipmentMovements } from "@/hooks"
import { useToast } from "@/hooks/use-toast"

interface MovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: any
  onClose: () => void
  onSuccess?: () => void
}

export function MovementDialog({ open, onOpenChange, equipment, onClose, onSuccess }: MovementDialogProps) {
  const { createMovement, loading } = useEquipmentMovementOperations()
  const { updateEquipment } = useEquipmentOperations()
  const { data: employees } = useEmployees()
  const { data: movements } = useEquipmentMovements(equipment?.id)
  const { toast } = useToast()
  const [movementType, setMovementType] = useState<"saida" | "devolucao">("saida")
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
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
      
      let selectedEmployee = null
      
      // Para saídas, validar colaborador
      if (!isReturn) {
        selectedEmployee = employees?.find(emp => emp.code === formData.employeeId)
        
        if (!selectedEmployee) {
          toast({
            title: "Erro",
            description: "Colaborador não encontrado. Verifique o código.",
            variant: "destructive",
          })
          return
        }
      } else {
        // Para devoluções, buscar o colaborador que está usando o equipamento
        console.log("Equipamento para devolução:", equipment)
        console.log("Movimentações do equipamento:", movements)
        
        // Buscar a última movimentação de saída (type: 'out')
        const lastOutMovement = movements?.find(mov => mov.type === 'out')
        
        if (lastOutMovement) {
          selectedEmployee = {
            id: lastOutMovement.employeeId,
            name: lastOutMovement.employeeName,
            code: lastOutMovement.employeeCode
          }
          console.log("Colaborador encontrado na movimentação:", selectedEmployee)
        } else {
          // Fallback: usar dados do assignedTo do equipamento
          selectedEmployee = {
            id: equipment.assignedTo || "unknown",
            name: equipment.assignedTo || "Colaborador",
            code: "DEV001"
          }
          console.log("Usando fallback para colaborador:", selectedEmployee)
        }
      }

      const movementData: any = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentCode: equipment.code,
        employeeId: selectedEmployee.id!,
        employeeName: selectedEmployee.name,
        employeeCode: selectedEmployee.code,
        type: isReturn ? 'return' as const : 'out' as const,
        project: formData.project,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.expectedReturn) {
        movementData.expectedReturnDate = formData.expectedReturn
      }
      
      if (isReturn) {
        movementData.actualReturnDate = new Date().toISOString().split('T')[0]
      }
      
      if (formData.observations) {
        movementData.observations = formData.observations
      }
      
      if (isReturn) {
        movementData.checklist = {
          equipmentGoodCondition: checklistItems[0].checked,
          accessoriesIncluded: checklistItems[1].checked,
          manualPresent: checklistItems[2].checked,
          equipmentClean: checklistItems[3].checked,
          noVisibleDamage: checklistItems[4].checked,
        }
      }

      console.log("Dados da movimentação:", movementData)
      
      await createMovement(movementData)
      console.log("Movimentação criada com sucesso")
      
      // Atualizar o status do equipamento
      const newStatus = isReturn ? 'available' : 'in_use'
      
      console.log("Atualizando equipamento:", { id: equipment.id, status: newStatus, isReturn })
      
      // Preparar dados de atualização
      const updateData: any = {
        status: newStatus
      }
      
      // Para saídas, adicionar assignedTo
      if (!isReturn) {
        updateData.assignedTo = selectedEmployee.name
      }
      // Para devoluções, não incluir assignedTo (será removido do documento)
      
      await updateEquipment(equipment.id, updateData)
      console.log("Equipamento atualizado com sucesso")
      
      toast({
        title: "Sucesso",
        description: isReturn ? "Devolução registrada com sucesso!" : "Saída registrada com sucesso!",
      })
      
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
            {equipment.assignedTo && (
              <p className="text-sm text-muted-foreground">
                Atualmente com: <span className="font-medium">{equipment.assignedTo}</span>
              </p>
            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">ID do Colaborador</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Ex: COL001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Nome do Colaborador</Label>
                    <Input
                      id="employeeName"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Projeto/Obra</Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obra-central">Obra Central</SelectItem>
                        <SelectItem value="obra-norte">Obra Norte</SelectItem>
                        <SelectItem value="obra-sul">Obra Sul</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn">Previsão de Devolução</Label>
                    <Input
                      id="expectedReturn"
                      type="date"
                      value={formData.expectedReturn}
                      onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
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
                  <Label>Checklist de Devolução</Label>
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
                  <Label htmlFor="returnObservations">Observações da Devolução</Label>
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
