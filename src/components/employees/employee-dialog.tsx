"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, User, Mail, Phone, MapPin, Calendar, Building, Briefcase, FileText, Plus, Check, Trash2 } from "lucide-react"
import { useEmployeeOperations } from "@/hooks"
import { useToast } from "@/hooks/use-toast"

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: any
  onClose: () => void
  onSuccess?: () => void
}

// Função para mapear status do formulário para o banco de dados
const mapStatusToDB = (status: string): 'active' | 'vacation' | 'away' | 'inactive' => {
  switch (status) {
    case 'Ativo':
      return 'active'
    case 'Férias':
      return 'vacation'
    case 'Afastado':
      return 'away'
    case 'Inativo':
      return 'inactive'
    default:
      return 'active'
  }
}

// Função para mapear status do banco de dados para o formulário
const mapStatusFromDB = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Ativo'
    case 'vacation':
      return 'Férias'
    case 'away':
      return 'Afastado'
    case 'inactive':
      return 'Inativo'
    default:
      return 'Ativo'
  }
}

export function EmployeeDialog({ open, onOpenChange, employee, onClose, onSuccess }: EmployeeDialogProps) {
  const { createEmployee, updateEmployee, deleteEmployee, loading } = useEmployeeOperations()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    position: "",
    department: "",
    phone: "",
    email: "",
    hireDate: "",
    status: "Ativo",
    address: "",
    cpf: "",
    rg: "",
    contracts: [] as string[],
  })

  const [newContract, setNewContract] = useState("")

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        code: employee.code || "",
        position: employee.position || "",
        department: employee.department || "",
        phone: employee.phone || "",
        email: employee.email || "",
        hireDate: employee.hireDate || "",
        status: mapStatusFromDB(employee.status) || "Ativo",
        address: employee.address || "",
        cpf: employee.cpf || "",
        rg: employee.rg || "",
        contracts: employee.contracts || [],
      })
    } else {
      // Resetar formulário para novo colaborador
      setFormData({
        name: "",
        code: "",
        position: "",
        department: "",
        phone: "",
        email: "",
        hireDate: "",
        status: "Ativo",
        address: "",
        cpf: "",
        rg: "",
        contracts: [],
      })
    }
  }, [employee, open]) // Adicionar 'open' como dependência para resetar quando o dialog abre

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Criar objeto base com campos obrigatórios
      const employeeData: any = {
        name: formData.name,
        code: formData.code,
        position: formData.position,
        department: formData.department,
        status: mapStatusToDB(formData.status),
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.email) {
        employeeData.email = formData.email
      }
      if (formData.phone) {
        employeeData.phone = formData.phone
      }
      if (formData.hireDate) {
        employeeData.hireDate = formData.hireDate
      }
      if (formData.address) {
        employeeData.address = formData.address
      }
      if (formData.cpf) {
        employeeData.cpf = formData.cpf
      }
      if (formData.rg) {
        employeeData.rg = formData.rg
      }
      if (formData.contracts && formData.contracts.length > 0) {
        employeeData.contracts = formData.contracts
      }

      if (employee) {
        // Atualizar colaborador existente
        await updateEmployee(employee.id, employeeData)
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso!",
        })
      } else {
        // Criar novo colaborador
        await createEmployee(employeeData)
        toast({
          title: "Sucesso",
          description: "Colaborador criado com sucesso!",
        })
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar colaborador. Tente novamente."
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!employee?.id) return

    try {
      await deleteEmployee(employee.id)
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso!",
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir colaborador. Tente novamente."
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const isEditing = !!employee

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const addContract = () => {
    if (newContract.trim() && !formData.contracts.includes(newContract.trim())) {
      setFormData({
        ...formData,
        contracts: [...formData.contracts, newContract.trim()]
      })
      setNewContract("")
    }
  }

  const removeContract = (contractToRemove: string) => {
    setFormData({
      ...formData,
      contracts: formData.contracts.filter(contract => contract !== contractToRemove)
    })
  }

  const handleContractKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addContract()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto p-4 sm:max-w-[95vw] sm:w-[95vw] sm:mx-0 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Detalhes do Colaborador" : "Novo Colaborador"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Visualize e edite as informações do colaborador" : "Cadastre um novo colaborador no sistema"}
          </DialogDescription>
        </DialogHeader>

        {isEditing && employee && (
          <Card className="mx-0">
            <CardHeader className="px-4 sm:px-6 py-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{employee.name}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{employee.position}</span>
                  </div>
                </div>
                <Badge
                  variant={mapStatusFromDB(employee.status) === "Ativo" ? "secondary" : "outline"}
                  className={
                    mapStatusFromDB(employee.status) === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : mapStatusFromDB(employee.status) === "Férias"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {mapStatusFromDB(employee.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo do colaborador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    Código
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: COL001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  Endereço
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Cargo
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Ex: Operador de Máquinas"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600" />
                    Departamento
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construção">Construção</SelectItem>
                      <SelectItem value="Engenharia">Engenharia</SelectItem>
                      <SelectItem value="Supervisão">Supervisão</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    Data de Contratação
                  </Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Férias">Férias</SelectItem>
                      <SelectItem value="Afastado">Afastado</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Contratos do Colaborador
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie os contratos em que este colaborador está envolvido
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção de Adicionar Contrato */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Label htmlFor="contracts" className="text-sm font-medium text-gray-700 mb-2 block">
                  Adicionar Novo Contrato
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="contracts"
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value)}
                    onKeyPress={handleContractKeyPress}
                    placeholder="Digite o nome do contrato..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={addContract}
                    disabled={!newContract.trim() || formData.contracts.includes(newContract.trim())}
                    className="px-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                {newContract.trim() && formData.contracts.includes(newContract.trim()) && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Este contrato já foi adicionado
                  </p>
                )}
              </div>

              {/* Lista de Contratos */}
              {formData.contracts.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Contratos Ativos ({formData.contracts.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.contracts.map((contract, index) => (
                      <div
                        key={contract}
                        className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {contract}
                            </h5>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            onClick={() => removeContract(contract)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">Nenhum contrato adicionado</p>
                  <p className="text-xs text-gray-400">Adicione contratos usando o campo acima</p>
                </div>
              )}
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
                {loading ? "Excluindo..." : "Excluir Colaborador"}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700" disabled={loading}>
                {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Colaborador")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
