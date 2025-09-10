"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, History, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmployeeDialog } from "@/components/employees/employee-dialog"
import { EmployeeHistoryDialog } from "@/components/employees/employee-history-dialog"
import { useEmployees } from "@/hooks"
import { Employee } from "@/lib/firestore"

export default function ColaboradoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const { data: employees, loading, error, refetch } = useEmployees()

  const filteredEmployees = useMemo(() => {
    if (!employees) return []
    
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [employees, searchTerm, statusFilter, departmentFilter])

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!employees) return { total: 0, active: 0, vacation: 0, away: 0 }
    
    return {
      total: employees.length,
      active: employees.filter(emp => emp.status === 'active').length,
      vacation: employees.filter(emp => emp.status === 'vacation').length,
      away: employees.filter(emp => emp.status === 'away').length,
    }
  }, [employees])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        )
      case "vacation":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Férias
          </Badge>
        )
      case "away":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Afastado
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Inativo
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }, [])

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Colaboradores</h1>
            <p className="text-muted-foreground">Gerencie os funcionários e suas atribuições</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar colaboradores: {error}</p>
            <Button onClick={refetch} className="cursor-pointer">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground">Gerencie os funcionários e suas atribuições</p>
        </div>
        <Button onClick={() => setIsEmployeeDialogOpen(true)} className="cursor-pointer w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">Total de Colaboradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.active}
              </div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.vacation}
              </div>
              <p className="text-xs text-muted-foreground">Em Férias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.away}
              </div>
              <p className="text-xs text-muted-foreground">Afastados</p>
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou cargo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="away">Afastado</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                <SelectItem value="Construção">Construção</SelectItem>
                <SelectItem value="Engenharia">Engenharia</SelectItem>
                <SelectItem value="Supervisão">Supervisão</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>{filteredEmployees.length} colaborador(es) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Contratação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Carregando colaboradores...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum colaborador encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-xs">{getInitials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email || 'Sem email'}</div>
                        <div className="text-xs text-muted-foreground">Código: {employee.code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{employee.createdAt.toDate().toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsEmployeeDialogOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsHistoryDialogOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-sm">{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{employee.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{employee.email || 'Sem email'}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {employee.code} • {employee.position}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{employee.department}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(employee.status)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsEmployeeDialogOpen(true)
                        }}
                        className="cursor-pointer h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsHistoryDialogOpen(true)
                        }}
                        className="cursor-pointer h-8 w-8"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status: {employee.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null)
          setIsEmployeeDialogOpen(false)
        }}
        onSuccess={() => {
          refetch() // Recarregar a lista de colaboradores
        }}
      />

      <EmployeeHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null)
          setIsHistoryDialogOpen(false)
        }}
      />
    </div>
  )
}
