"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Eye,
  History,
  Loader2,
  User,
  Hash,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Pencil,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { EmployeeHistoryDialog } from "@/components/employees/employee-history-dialog";
import { EmployeeViewDialog } from "@/components/employees/employee-view-dialog";
import { VirtualPagination } from "@/components/ui/virtual-pagination";
import { PerformanceComparison } from "@/components/performance-comparison";
import { useEmployeesQuery, useVirtualPagination } from "@/hooks";
import { Employee } from "@/lib/supabase";

export default function ColaboradoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const {
    data: employees = [],
    isLoading: loading,
    error,
    refetch,
  } = useEmployeesQuery();

  // Usar paginação virtual
  const {
    paginatedData: filteredEmployees,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
  } = useVirtualPagination({
    data: employees || [],
    itemsPerPage: 20,
    searchTerm,
    searchFields: ["name", "code", "position", "email"],
    filters: {
      status: statusFilter,
      department: departmentFilter,
    },
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!employees) return { total: 0, active: 0, vacation: 0, away: 0 };

    return {
      total: employees.length,
      active: employees.filter((emp) => emp.status === "active").length,
      vacation: employees.filter((emp) => emp.status === "vacation").length,
      away: employees.filter((emp) => emp.status === "away").length,
    };
  }, [employees]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "vacation":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Férias
          </Badge>
        );
      case "away":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Afastado
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Inativo
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Colaboradores
            </h1>
            <p className="text-muted-foreground">
              Gerencie os funcionários e suas atribuições
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              Erro ao carregar colaboradores: {String(error?.message || 'Erro desconhecido')}
            </p>
            <Button onClick={() => refetch()} className="cursor-pointer">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Colaboradores
          </h1>
          <p className="text-muted-foreground">
            Gerencie os funcionários e suas atribuições
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setIsEmployeeDialogOpen(true);
          }}
          className="cursor-pointer w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.total
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de Colaboradores
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.active
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.vacation
              )}
            </div>
            <p className="text-xs text-muted-foreground">Em Férias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.away
              )}
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
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
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
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
          <CardDescription>
            {totalItems} colaborador(es) encontrado(s)
            {totalItems > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Página {currentPage} de {totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Colaborador</TableHead>
                  <TableHead className="w-[180px]">Cargo</TableHead>
                  <TableHead className="w-[160px]">Contratos Ativos</TableHead>
                  <TableHead className="w-[140px]">Departamento</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">
                    Data de Contratação
                  </TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Carregando colaboradores...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum colaborador encontrado
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-xs">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {employee.name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {employee.email || "Sem email"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Código: {employee.code}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div
                          className="font-medium truncate"
                          title={employee.position}
                        >
                          {employee.position}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          {employee.contracts &&
                          employee.contracts.length > 0 ? (
                            employee.contracts
                              .slice(0, 2)
                              .map((contract: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs w-fit truncate"
                                >
                                  {contract}
                                </Badge>
                              ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sem contratos
                            </span>
                          )}
                          {employee.contracts &&
                            employee.contracts.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{employee.contracts.length - 2} mais
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="truncate" title={employee.department}>
                          {employee.department}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(employee.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          {new Date(employee.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEmployeeDialogOpen(true);
                            }}
                            className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Editar colaborador"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsViewDialogOpen(true);
                            }}
                            className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Visualizar colaborador"
                          >
                            <Eye className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsHistoryDialogOpen(true);
                            }}
                            className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Histórico do colaborador"
                          >
                            <History className="h-4 w-4 text-green-600" />
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
                      <AvatarFallback className="text-sm">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {employee.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {employee.email || "Sem email"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {employee.code} • {employee.position}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {employee.department}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {employee.contracts && employee.contracts.length > 0 ? (
                          employee.contracts.map(
                            (contract: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {contract}
                              </Badge>
                            )
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Sem contratos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(employee.status)}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEmployeeDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Editar colaborador"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsViewDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Visualizar colaborador"
                      >
                        <Eye className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsHistoryDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Histórico do colaborador"
                      >
                        <History className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status: {employee.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {totalItems > 0 && (
            <VirtualPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
              onItemsPerPageChange={setItemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
              isLoading={loading}
              showItemsPerPageSelector={true}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Comparação de Performance */}
      <PerformanceComparison
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null);
          setIsEmployeeDialogOpen(false);
        }}
        onSuccess={() => {
          refetch(); // Recarregar a lista de colaboradores
        }}
      />

      <EmployeeHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null);
          setIsHistoryDialogOpen(false);
        }}
      />

      <EmployeeViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null);
          setIsViewDialogOpen(false);
        }}
      />
    </div>
  );
}
