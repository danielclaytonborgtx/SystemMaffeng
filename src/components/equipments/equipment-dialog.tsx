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
import { useEquipmentOperations, useEquipmentMovements, useBarcodeReader } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { Package, Hash, DollarSign, Calendar, MapPin, FileText, Truck, Wrench, Camera, CameraOff } from "lucide-react"

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: any
  onClose: () => void
  onSuccess?: () => void
}

// Helper: formata data/hora para pt-BR, com detecção de Timestamp do Firestore, strings ISO e "date-only"
function formatDateTime(value: any): { date: string; time: string | null } {
  if (!value) return { date: "", time: null }

  // Firestore Timestamp (possui toDate)
  if (typeof value === "object" && value !== null && typeof value.toDate === "function") {
    const d: Date = value.toDate()
    return {
      date: d.toLocaleDateString("pt-BR"),
      time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  // String: checar formatos
  if (typeof value === "string") {
    // 1) date-only: YYYY-MM-DD (sem horário) => criar Date local (garante não "recuar" o dia)
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateOnlyMatch) {
      const y = Number(dateOnlyMatch[1])
      const m = Number(dateOnlyMatch[2])
      const d = Number(dateOnlyMatch[3])
      const local = new Date(y, m - 1, d) // cria no horário local
      return { date: local.toLocaleDateString("pt-BR"), time: local.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
    }

    // 2) ISO com Z (UTC): YYYY-MM-DDTHH:MM:SSZ
    // Se for meia-noite UTC (00:00:00Z), normalmente foi usado somente para representar "apenas a data" no backend.
    // Neste caso, tratamos como date-only para evitar o "-3h" que o JS aplicaria e mostraria dia anterior.
    const isoZMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/)
    if (isoZMatch) {
      const hh = isoZMatch[4]
      const mm = isoZMatch[5]
      const ss = isoZMatch[6]
      if (hh === "00" && mm === "00" && ss === "00") {
        const y = Number(isoZMatch[1])
        const m = Number(isoZMatch[2])
        const d = Number(isoZMatch[3])
        const local = new Date(y, m - 1, d)
        return { date: local.toLocaleDateString("pt-BR"), time: local.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
      }
      // caso contrário, interpretar normalmente (conversão UTC -> local é apropriada)
      const dObj = new Date(value)
      return {
        date: dObj.toLocaleDateString("pt-BR"),
        time: dObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }
    }

    // 3) outras strings ISO (com offset ou sem Z): parse normal
    const parsed = new Date(value)
    if (isNaN(parsed.getTime())) {
      return { date: String(value), time: null }
    }
    return {
      date: parsed.toLocaleDateString("pt-BR"),
      time: parsed.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  // Fallback para outros tipos (número, Date, etc.)
  const d = new Date(value)
  if (isNaN(d.getTime())) return { date: String(value), time: null }
  return { date: d.toLocaleDateString("pt-BR"), time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
}

export function EquipmentDialog({ open, onOpenChange, equipment, onClose, onSuccess }: EquipmentDialogProps) {
  const { createEquipment, updateEquipment, deleteEquipment, loading } = useEquipmentOperations()
  const { data: movements, loading: movementsLoading } = useEquipmentMovements(equipment?.id)
  const { toast } = useToast()
  
  // Debug: log das movimentações
  console.log('EquipmentDialog - Equipamento ID:', equipment?.id)
  console.log('EquipmentDialog - Movimentações:', movements)
  console.log('EquipmentDialog - Loading:', movementsLoading)
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

  // Hook para leitura óptica
  const {
    isActive: isScanningActive,
    isSupported: isBarcodeSupported,
    error: barcodeError,
    videoRef,
    startScanning,
    stopScanning
  } = useBarcodeReader({
    onCodeRead: (code) => {
      setFormData({ ...formData, code })
      toast({
        title: "Código lido com sucesso!",
        description: `Código: ${code}`,
      })
      stopScanning()
    },
    onError: (error) => {
      toast({
        title: "Erro na leitura óptica",
        description: error,
        variant: "destructive"
      })
    }
  })

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        type: equipment.category || "",
        code: equipment.code || "",
        value: equipment.value?.toString() || "",
        description: equipment.description || "",
        purchaseDate: equipment.purchase_date || "",
        supplier: equipment.supplier || "",
        invoiceNumber: equipment.invoice_number || "",
        location: equipment.location || "",
      })
    } else {
      // Resetar formulário para novo equipamento
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
  }, [equipment, open]) // Adicionar 'open' como dependência para resetar quando o dialog abre

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
        equipmentData.purchase_date = formData.purchaseDate
      }
      if (formData.supplier) {
        equipmentData.supplier = formData.supplier
      }
      if (formData.invoiceNumber) {
        equipmentData.invoice_number = formData.invoiceNumber
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
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar equipamento. Tente novamente."
      toast({
        title: "Erro",
        description: errorMessage,
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
      console.error('Erro detalhado ao deletar equipamento:', error)
      
      let errorMessage = "Erro ao excluir equipamento. Tente novamente."
      
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = "Não é possível excluir este equipamento pois ele possui movimentações registradas. As movimentações serão excluídas automaticamente."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Nome do Equipamento
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Furadeira Bosch GSB 550"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    Código
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: EQ001"
                      required
                      className="flex-1"
                    />
                    {isBarcodeSupported && (
                      <Button
                        type="button"
                        variant={isScanningActive ? "destructive" : "outline"}
                        size="icon"
                        onClick={isScanningActive ? stopScanning : startScanning}
                        title={isScanningActive ? "Parar leitura" : "Ler código óptico"}
                      >
                        {isScanningActive ? (
                          <CameraOff className="h-4 w-4" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {barcodeError && (
                    <p className="text-sm text-red-600">{barcodeError}</p>
                  )}
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
                      <SelectItem value="Ferramenta Elétrica">Ferramenta Elétrica</SelectItem>
                      <SelectItem value="Ferramenta Pneumática">Ferramenta Pneumática</SelectItem>
                      <SelectItem value="Equipamento de Segurança">Equipamento de Segurança</SelectItem>
                      <SelectItem value="Máquina Pesada">ferramentas Manuais</SelectItem>
                      <SelectItem value="Mobiliário">Ferramentas descartáveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Valor (R$)
                  </Label>
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
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Descrição
                </Label>
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
                  <Label htmlFor="purchaseDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    Data de Compra
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    Fornecedor
                  </Label>
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
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-yellow-600" />
                    Localização Atual
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Almoxarifado">Almoxarifado</SelectItem>      
                      <SelectItem value="Obra">Obra</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing && equipment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                {movementsLoading ? (
                  <p className="text-muted-foreground">Carregando histórico...</p>
                ) : movements && movements.length > 0 ? (
                  <div className="space-y-3">
                    {movements.slice(0, 5).map((movement: any) => {
                      const created = new Date(movement.created_at)
                      const returned = movement.actual_return_date ? new Date(movement.actual_return_date) : null

                      return (
                        <div key={movement.id} className="p-3 border rounded-lg">
                          {/* Cabeçalho: Badge + Funcionário + Projeto */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={movement.actual_return_date ? "outline" : "secondary"}>
                                {movement.actual_return_date ? "Devolvido" : "Saída"}
                              </Badge>
                              <span className="text-sm font-medium">{movement.employee_name}</span>
                              <span className="text-xs text-muted-foreground">({movement.employee_code})</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Projeto: {movement.project}</span>
                          </div>

                          {/* Corpo: datas em colunas */}
                          <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Saída:</span><br />
                              {created.toLocaleDateString('pt-BR')} às {created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {returned && (
                              <div>
                                <span className="font-medium">Devolução:</span><br />
                                {returned.toLocaleDateString('pt-BR')} às {returned.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
          )}

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

        {/* Vídeo da câmera para leitura óptica */}
        {isScanningActive && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Posicione o código na câmera</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopScanning}
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded border"
              />
              <div className="absolute inset-0 border-2 border-red-500 rounded pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-red-500"></div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
