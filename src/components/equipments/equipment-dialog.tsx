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
import { supabase } from "@/lib/supabase"
import { Package, Hash, DollarSign, Calendar, MapPin, FileText, Truck, Wrench, Camera, CameraOff, Upload, X, Activity } from "lucide-react"

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
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    code: "",
    value: "",
    description: "",
    purchaseDate: "",
    supplier: "",
    invoiceNumber: "",
    status: "available",
  })
  
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  // Função para lidar com upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar se é uma imagem ou PDF
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (allowedTypes.includes(file.type)) {
        setInvoiceFile(file)
        toast({
          title: "Arquivo selecionado",
          description: `${file.name} foi selecionado com sucesso!`,
        })
      } else {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas imagens (JPG, PNG) ou PDF.",
          variant: "destructive",
        })
      }
    }
  }

  // Função para remover arquivo
  const removeFile = () => {
    setInvoiceFile(null)
    // Resetar o input file
    const fileInput = document.getElementById('invoiceFile') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Função para baixar arquivo atual
  const handleDownloadCurrentFile = async (filePath: string) => {
    try {
      console.log('Baixando arquivo atual:', filePath)
      
      // Baixar arquivo do Supabase Storage
      const { data, error } = await supabase.storage
        .from('equipment-invoices')
        .download(filePath)
      
      if (error) {
        console.error('Erro ao baixar arquivo:', error)
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o arquivo da nota fiscal.",
          variant: "destructive",
        })
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
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      })
    }
  }

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
        status: equipment.status || "available",
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
        status: "available",
      })
      setInvoiceFile(null) // Resetar arquivo também
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
        status: formData.status,
        location: "Almoxarifado", // Localização padrão
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
      
      // Adicionar arquivo da nota fiscal se existir
      if (invoiceFile) {
        try {
          // Criar nome único para o arquivo
          const fileExtension = invoiceFile.name.split('.').pop()
          const uniqueFileName = `invoice_${equipment?.id || 'new'}_${Date.now()}.${fileExtension}`
          
          console.log('Iniciando upload do arquivo:', {
            fileName: uniqueFileName,
            originalName: invoiceFile.name,
            size: invoiceFile.size,
            type: invoiceFile.type
          })
          
          // Upload do arquivo para Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('equipment-invoices')
            .upload(uniqueFileName, invoiceFile)
          
          console.log('Resultado do upload:', { uploadData, uploadError })
          
          if (uploadError) {
            console.error('Erro ao fazer upload do arquivo:', uploadError)
            toast({
              title: "Erro no upload",
              description: "Não foi possível salvar o arquivo da nota fiscal.",
              variant: "destructive",
            })
          } else {
            console.log('Arquivo salvo com sucesso:', uploadData.path)
            equipmentData.invoice_file = uploadData.path // Caminho do arquivo no storage
          }
        } catch (error) {
          console.error('Erro ao processar arquivo:', error)
          toast({
            title: "Erro no arquivo",
            description: "Não foi possível processar o arquivo da nota fiscal.",
            variant: "destructive",
          })
        }
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
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden mx-auto p-2 sm:max-w-[95vw] sm:w-[95vw] sm:max-h-[95vh] sm:mx-0 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite as informações do equipamento" : "Cadastre um novo equipamento no sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6">
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


              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    Status do Equipamento
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Disponível
                        </div>
                      </SelectItem>
                      <SelectItem value="in_use">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Em Uso
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Manutenção
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.status === 'maintenance' && (
                    <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      ⚠️ Equipamento em manutenção não pode ser movimentado até voltar ao status "Disponível"
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Informações de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6">
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
                  <Label htmlFor="invoiceFile">Anexar Nota Fiscal</Label>
                  
                  {/* Input de arquivo sempre presente */}
                  <input
                    id="invoiceFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {/* Arquivo atual (se existir e não há novo arquivo) */}
                  {equipment?.invoice_file && !invoiceFile && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{equipment.invoice_file}</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCurrentFile(equipment.invoice_file)}
                            className="h-7 px-3 text-xs flex-1 sm:flex-none cursor-pointer"
                          >
                            <FileText className="h-3 w-3 mr-1 text-blue-600" />
                            Baixar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('invoiceFile')?.click()}
                            className="h-7 px-3 text-xs flex-1 sm:flex-none cursor-pointer"
                          >
                            <Upload className="h-3 w-3 mr-1 text-orange-600" />
                            Trocar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Novo arquivo selecionado */}
                  {invoiceFile && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-700 truncate">{invoiceFile.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="h-7 px-3 text-xs text-red-600 hover:text-red-700 w-full sm:w-auto cursor-pointer"
                        >
                          <X className="h-3 w-3 mr-1 text-red-600" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Botão para selecionar arquivo (se não há arquivo atual) */}
                  {!equipment?.invoice_file && !invoiceFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('invoiceFile')?.click()}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 text-blue-600" />
                      Selecionar Arquivo
                    </Button>
                  )}
                </div>
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
                {loading ? "Excluindo..." : "Excluir Equipamento"}
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer w-full sm:w-auto" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700 w-full sm:w-auto" disabled={loading}>
                {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Equipamento")}
              </Button>
            </div>
          </div>
        </form>

        {/* Vídeo da câmera para leitura óptica */}
        {isScanningActive && (
          <div className="mt-4 p-3 sm:p-4 border rounded-lg bg-gray-50 mx-3 sm:mx-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <Label className="text-xs sm:text-sm font-medium">Posicione o código na câmera</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopScanning}
                className="w-full sm:w-auto"
              >
                <CameraOff className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Fechar</span>
                <span className="sm:hidden">Fechar Câmera</span>
              </Button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 sm:h-64 object-cover rounded border"
              />
              <div className="absolute inset-0 border-2 border-red-500 rounded pointer-events-none">
                <div className="absolute top-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-red-500"></div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
