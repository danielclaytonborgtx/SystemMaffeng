"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VirtualPagination } from "@/components/ui/virtual-pagination";
import {
  CalendarDays,
  Package,
  ArrowUpDown,
  Loader2,
  User,
  Hash,
  MapPin,
  Clock,
} from "lucide-react";
import { useEquipmentMovements, useVirtualPagination } from "@/hooks";

interface EmployeeHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  onClose: () => void;
}

export function EmployeeHistoryDialog({
  open,
  onOpenChange,
  employee,
  onClose,
}: EmployeeHistoryDialogProps) {
  const {
    data: movements,
    loading,
    error,
  } = useEquipmentMovements(undefined, employee?.id);

  // Paginação virtual para o histórico de movimentações
  const {
    paginatedData: paginatedMovements,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
  } = useVirtualPagination({
    data: movements || [],
    itemsPerPage: 10,
  });

  // Debug: log das movimentações do colaborador
  console.log("Colaborador:", employee?.id, employee?.name, employee);
  console.log("Movimentações encontradas:", movements);
  console.log("Loading:", loading, "Error:", error);

  if (!employee) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusBadge = (movement: any) => {
    if (movement.actual_return_date) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Devolvido
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Em Uso
        </Badge>
      );
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";

    let date: Date;

    // Firestore Timestamp
    if (timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    }
    // String de data (formato YYYY-MM-DD ou ISO)
    else if (typeof timestamp === "string") {
      // Se for uma string de data simples (YYYY-MM-DD), criar data local diretamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
        const [year, month, day] = timestamp.split("-").map(Number);
        date = new Date(year, month - 1, day); // month é 0-indexed
      }
      // Se for uma string ISO com Z (UTC), tratar como data local para evitar problemas de fuso
      else if (timestamp.includes("T") && timestamp.includes("Z")) {
        const isoDate = new Date(timestamp);
        // Criar data local para evitar problemas de fuso horário
        date = new Date(
          isoDate.getFullYear(),
          isoDate.getMonth(),
          isoDate.getDate()
        );
      } else {
        date = new Date(timestamp);
      }
    }
    // Outros tipos (Date, number, etc.)
    else {
      date = new Date(timestamp);
    }

    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("pt-BR");
  };

  const calculateDaysUsed = (startTimestamp: any, endTimestamp?: any) => {
    const start =
      startTimestamp && startTimestamp.toDate
        ? startTimestamp.toDate()
        : new Date(startTimestamp);
    const end =
      endTimestamp && endTimestamp.toDate
        ? endTimestamp.toDate()
        : endTimestamp
        ? new Date(endTimestamp)
        : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto p-4 sm:max-w-[95vw] sm:w-[95vw] sm:mx-0 sm:p-6">
        <DialogHeader>
          <DialogTitle>Histórico de Equipamentos</DialogTitle>
          <DialogDescription>
            Histórico completo de utilização de equipamentos
          </DialogDescription>
        </DialogHeader>

        <Card className="mx-0">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{employee.name}</div>
                <div className="text-sm text-muted-foreground">
                  {employee.code} • {employee.position}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">Equipamentos Ativos</div>
                  <div className="text-2xl font-bold">
                    {employee.equipmentCount}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm font-medium">
                    Total de Movimentações
                  </div>
                  <div className="text-2xl font-bold">
                    {movements?.length || 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium">Desde</div>
                  <div className="text-lg font-semibold">
                    {formatDate(employee.hire_date)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mx-0">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Data Retirada</TableHead>
                    <TableHead>Data Devolução</TableHead>
                    <TableHead>Dias de Uso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Carregando histórico...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-red-500">
                          Erro ao carregar histórico
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedMovements && paginatedMovements.length > 0 ? (
                    paginatedMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {movement.equipment_name}
                        </TableCell>
                        <TableCell>{movement.equipment_code}</TableCell>
                        <TableCell>{formatDate(movement.created_at)}</TableCell>
                        <TableCell>
                          {movement.actual_return_date
                            ? formatDate(movement.actual_return_date)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {movement.type === "out"
                            ? calculateDaysUsed(
                                movement.created_at,
                                movement.actual_return_date
                              ) + " dias"
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(movement)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">
                          Nenhuma movimentação encontrada
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Carregando histórico...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Erro ao carregar histórico</p>
                </div>
              ) : paginatedMovements && paginatedMovements.length > 0 ? (
                paginatedMovements.map((movement) => (
                  <Card key={movement.id} className="p-3 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {movement.equipment_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {movement.equipment_code}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(movement)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Data Retirada:
                          </span>
                          <div className="font-medium">
                            {formatDate(movement.created_at)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Data Devolução:
                          </span>
                          <div className="font-medium">
                            {movement.actual_return_date
                              ? formatDate(movement.actual_return_date)
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Dias de Uso:
                          </span>
                          <div className="font-medium">
                            {movement.actual_return_date
                              ? calculateDaysUsed(
                                  movement.created_at,
                                  movement.actual_return_date
                                ) + " dias"
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </p>
                </div>
              )}

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
                  itemsPerPageOptions={[5, 10, 20]}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
