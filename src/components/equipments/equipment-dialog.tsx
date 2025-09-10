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
import { useEquipmentOperations } from "@/hooks"
import { useToast } from "@/hooks/use-toast"

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: any
  onClose: () => void
  onSuccess?: () => void
}


export function EquipmentDialog({ open, onOpenChange, equipment, onClose, onSuccess }: EquipmentDialogProps) {
  const { createEquipment, updateEquipment, deleteEquipment, loading } = useEquipmentOperations()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    code: "",
    value: "",
    description: "",
    purchaseDate: "",
    supplier: "",
    invoiceNumber: "",
    location: "",
  })

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        type: equipment.category || "",
        code: equipment.code || "",
        value: equipment.value?.toString() || "",
        description: equipment.description || "",
        purchaseDate: equipment.purchaseDate || "",
        supplier: equipment.supplier || "",
        invoiceNumber: equipment.invoiceNumber || "",
        location: equipment.location || "",
      })
    } else {
      setFormData({
        name: "",
        type: "",
        code: "",
        value: "",
        description: "",
        purchaseDate: "",
        supplier: "",
        invoiceNumber: "",
        location: "",
      })
    }
  }, [equipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Criar objeto base com campos obrigatórios
      const equipmentData: any = {
        name: formData.name,
        code: formData.code,
        category: formData.type,
        status: 'available' as const,
        location: formData.location,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.value) {
        equipmentData.value = parseFloat(formData.value)
      }
      if (formData.description) {
        equipmentData.description = formData.description
      }
      if (formData.purchaseDate) {
        equipmentData.purchaseDate = formData.purchaseDate
      }
      if (formData.supplier) {
        equipmentData.supplier = formData.supplier
      }
      if (formData.invoiceNumber) {
        equipmentData.invoiceNumber = formData.invoiceNumber
      }

      if (equipment) {
        // Atualizar equipamento existente
        await updateEquipment(equipment.id, equipmentData)
        toast({
          title: "Sucesso",
          description: "Equipamento atualizado com sucesso!",
        })
      } else {
        // Criar novo equipamento
        await createEquipment(equipmentData)
        toast({
          title: "Sucesso",
          description: "Equipamento criado com sucesso!",
        })
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar equipamento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!equipment?.id) return

    try {
      await deleteEquipment(equipment.id)
      toast({
        title: "Sucesso",
        description: "Equipamento excluído com sucesso!",
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir equipamento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isEditing = !!equipment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto mx-2">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalhes do Equipamento" : "Novo Equipamento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Visualize e edite as informações do equipamento" : "Cadastre um novo equipamento no sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Equipamento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Furadeira Bosch GSB 550"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: EQ001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ferramenta Elétrica">Ferramenta Elétrica</SelectItem>
                      <SelectItem value="Ferramenta Pneumática">Ferramenta Pneumática</SelectItem>
                      <SelectItem value="Equipamento de Segurança">Equipamento de Segurança</SelectItem>
                      <SelectItem value="Máquina Pesada">Máquina Pesada</SelectItem>
                      <SelectItem value="Mobiliário">Mobiliário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do equipamento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Data de Compra</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Número da Nota Fiscal</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="Ex: NF-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização Atual</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Almoxarifado A">Almoxarifado A</SelectItem>
                      <SelectItem value="Almoxarifado B">Almoxarifado B</SelectItem>
                      <SelectItem value="Obra Central">Obra Central</SelectItem>
                      <SelectItem value="Obra Norte">Obra Norte</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                {loading ? "Excluindo..." : "Excluir Equipamento"}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700" disabled={loading}>
                {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Equipamento")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
