"use client"

import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Calendar, Building, Briefcase, FileText, Hash } from "lucide-react"

interface EmployeeViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: any
  onClose: () => void
}

// Função para mapear status do banco de dados para exibição
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

// Função para obter cor do badge de status
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'vacation':
      return 'bg-blue-100 text-blue-800'
    case 'away':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Função para obter iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function EmployeeViewDialog({ open, onOpenChange, employee, onClose }: EmployeeViewDialogProps) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Informações do Colaborador</DialogTitle>
          <DialogDescription>
            Visualize os dados completos do colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com Avatar e Informações Básicas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                    <Badge className={getStatusBadgeColor(employee.status)}>
                      {mapStatusFromDB(employee.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span>Código: {employee.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <span>{employee.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span>{employee.department}</span>
                    </div>
                    {employee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-orange-600" />
                        <span>{employee.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{employee.phone}</p>
                    </div>
                  </div>
                )}
                {employee.cpf && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">CPF</p>
                      <p className="text-sm text-muted-foreground">{employee.cpf}</p>
                    </div>
                  </div>
                )}
                {employee.rg && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">RG</p>
                      <p className="text-sm text-muted-foreground">{employee.rg}</p>
                    </div>
                  </div>
                )}
                {employee.hire_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Data de Contratação</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(employee.hire_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {employee.address && (
                <div className="mt-4 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{employee.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contratos */}
          {employee.contracts && employee.contracts.length > 0 && (
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Contratos Ativos
              </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.contracts.map((contract: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {contract}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Data de Criação</p>
                  <p className="text-muted-foreground">
                    {new Date(employee.created_at).toLocaleDateString('pt-BR')} às {new Date(employee.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Última Atualização</p>
                  <p className="text-muted-foreground">
                    {new Date(employee.updated_at).toLocaleDateString('pt-BR')} às {new Date(employee.updated_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
