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
import { useEmployeeOperations, useEquipmentMovements } from "@/hooks"
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
  const { data: movements, loading: movementsLoading } = useEquipmentMovements(undefined, employee?.id)
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
  })

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
      })
    } else {
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
      })
    }
  }, [employee])

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
      toast({
        title: "Erro",
        description: "Erro ao salvar colaborador. Tente novamente.",
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
      toast({
        title: "Erro",
        description: "Erro ao excluir colaborador. Tente novamente.",
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
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.position}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Equipamentos Recentes:</span>
                  <div className="mt-1 space-y-1">
                    {movementsLoading ? (
                      <span className="text-muted-foreground">Carregando...</span>
                    ) : movements && movements.length > 0 ? (
                      <div className="space-y-1">
                        {movements.slice(0, 3).map((movement) => (
                          <div key={movement.id} className="text-xs">
                            <Badge variant={movement.type === 'out' ? 'secondary' : 'outline'} className="mr-1">
                              {movement.type === 'out' ? 'Saída' : 'Devolução'}
                            </Badge>
                            <span className="text-muted-foreground">
                              {movement.equipmentName} ({movement.equipmentCode})
                            </span>
                          </div>
                        ))}
                        {movements.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            E mais {movements.length - 3} movimentações...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Nenhuma movimentação</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="mt-1">
                    <Badge
                      variant={employee.status === "Ativo" ? "secondary" : "outline"}
                      className={
                        employee.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : employee.status === "Férias"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
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
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo do colaborador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="address">Endereço</Label>
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
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Ex: Operador de Máquinas"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
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
                  <Label htmlFor="hireDate">Data de Contratação</Label>
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
