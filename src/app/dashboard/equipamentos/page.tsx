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
  ArrowUpDown,
  Loader2,
  Package,
  Hash,
  Wrench,
  MapPin,
  Settings,
  Pencil,
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
import { EquipmentDialog } from "@/components/equipments/equipment-dialog";
import { MovementDialog } from "@/components/equipments/movement-dialog";
import { EquipmentViewDialog } from "@/components/equipments/equipment-view-dialog";
import { VirtualPagination } from "@/components/ui/virtual-pagination";
import { PerformanceComparison } from "@/components/performance-comparison";
import {
  useEquipmentQuery,
  useEmployeesQuery,
  useVirtualPagination,
  useEquipmentMutations,
} from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/lib/supabase";

export default function EquipamentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const {
    data: equipments = [],
    isLoading: loading,
    error,
    refetch,
  } = useEquipmentQuery();
  const { data: employees = [] } = useEmployeesQuery();
  const { deleteEquipment } = useEquipmentMutations();
  const { toast } = useToast();

  // Usar paginação virtual
  const {
    paginatedData: paginatedEquipments,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
  } = useVirtualPagination({
    data: equipments || [],
    itemsPerPage: 20,
    searchTerm,
    searchFields: ["name", "code", "category"],
    filters: {
      status: statusFilter,
      category: typeFilter,
    },
  });

  // Função para obter o nome do colaborador pelo ID
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId || !employees) return "-";
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "-";
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!equipments)
      return { total: 0, available: 0, inUse: 0, maintenance: 0 };

    return {
      total: equipments.length,
      available: equipments.filter((eq) => eq.status === "available").length,
      inUse: equipments.filter((eq) => eq.status === "in_use").length,
      maintenance: equipments.filter((eq) => eq.status === "maintenance")
        .length,
    };
  }, [equipments]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Disponível
          </Badge>
        );
      case "in_use":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Em Uso
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Manutenção
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  // Função temporariamente desabilitada - será implementada nas mutations
  const handleFixInconsistentData = async () => {
    toast({
      title: "Função em migração",
      description: "Esta função será reimplementada com React Query mutations.",
      variant: "default",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Equipamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os equipamentos e suas movimentações
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              Erro ao carregar equipamentos: {error?.message || String(error)}
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
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de equipamentos
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEquipment(null);
            setIsEquipmentDialogOpen(true);
          }}
          className="cursor-pointer w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
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
              Total de Equipamentos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.available
              )}
            </div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.inUse
              )}
            </div>
            <p className="text-xs text-muted-foreground">Em Uso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.maintenance
              )}
            </div>
            <p className="text-xs text-muted-foreground">Em Manutenção</p>
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
                placeholder="Buscar por nome ou código..."
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
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="in_use">Em Uso</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Ferramenta Elétrica">
                  Ferramenta Elétrica
                </SelectItem>
                <SelectItem value="Ferramenta Pneumática">
                  Ferramenta Pneumática
                </SelectItem>
                <SelectItem value="Equipamento de Segurança">
                  Ferramentas Manuais
                </SelectItem>
                <SelectItem value="Equipamento de Segurança">
                  Ferramentas Descartáveis
                </SelectItem>
                <SelectItem value="Equipamento de Segurança">
                  Equipamento de Segurança
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipamentos</CardTitle>
          <CardDescription>
            {totalItems} equipamento(s) encontrado(s)
            {totalItems > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Página {currentPage} de {totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Código</TableHead>
                    <TableHead className="w-48">Nome</TableHead>
                    <TableHead className="w-32">Categoria</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Responsável</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Carregando equipamentos...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedEquipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">
                          Nenhum equipamento encontrado
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEquipments.map((equipment) => (
                      <TableRow key={equipment.id}>
                        <TableCell className="font-medium text-xs px-2">
                          {equipment.code}
                        </TableCell>
                        <TableCell className="font-medium text-sm truncate px-2">
                          {equipment.name}
                        </TableCell>
                        <TableCell className="text-xs px-2">
                          {equipment.category}
                        </TableCell>
                        <TableCell className="px-2">
                          {getStatusBadge(equipment.status)}
                        </TableCell>
                        <TableCell className="text-xs px-2">
                          {getEmployeeName(equipment.assigned_to)}
                        </TableCell>
                        <TableCell className="px-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipment(equipment);
                                setIsEquipmentDialogOpen(true);
                              }}
                              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 h-6 w-6 p-0"
                              title="Editar equipamento"
                            >
                              <Pencil className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipment(equipment);
                                setIsViewDialogOpen(true);
                              }}
                              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 h-6 w-6 p-0"
                              title="Visualizar equipamento"
                            >
                              <Eye className="h-3 w-3 text-purple-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipment(equipment);
                                setIsMovementDialogOpen(true);
                              }}
                              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 h-6 w-6 p-0"
                              title="Histórico de movimentação"
                            >
                              <ArrowUpDown className="h-3 w-3 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedEquipments.map((equipment) => (
              <Card key={equipment.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {equipment.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {equipment.code} • {equipment.category}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Local: {equipment.location}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {equipment.status}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Responsável: {getEmployeeName(equipment.assigned_to)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(equipment.status)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setIsEquipmentDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Editar equipamento"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setIsViewDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Visualizar equipamento"
                      >
                        <Eye className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setIsMovementDialogOpen(true);
                        }}
                        className="cursor-pointer h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Histórico de movimentação"
                      >
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Categoria:
                    </span>
                    <span className="text-sm font-medium">
                      {equipment.category}
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

      <EquipmentDialog
        open={isEquipmentDialogOpen}
        onOpenChange={setIsEquipmentDialogOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null);
          setIsEquipmentDialogOpen(false);
        }}
        onSuccess={() => {
          refetch(); // Recarregar a lista de equipamentos
        }}
      />

      <MovementDialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null);
          setIsMovementDialogOpen(false);
        }}
        onSuccess={() => {
          refetch(); // Recarregar a lista de equipamentos
        }}
      />

      <EquipmentViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null);
          setIsViewDialogOpen(false);
        }}
      />
    </div>
  );
}
