"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Package, ArrowUpDown } from "lucide-react"

interface EmployeeHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: any
  onClose: () => void
}

// Mock data para histórico de equipamentos
const equipmentHistory = [
  {
    id: 1,
    equipmentName: "Furadeira Bosch GSB 550",
    equipmentCode: "EQ001",
    action: "Retirada",
    date: "2024-03-15",
    returnDate: "2024-03-20",
    project: "Obra Central",
    status: "Devolvido",
  },
  {
    id: 2,
    equipmentName: "Martelo Pneumático Makita",
    equipmentCode: "EQ002",
    action: "Retirada",
    date: "2024-03-10",
    returnDate: null,
    project: "Obra Norte",
    status: "Em Uso",
  },
  {
    id: 3,
    equipmentName: "Serra Circular Dewalt",
    equipmentCode: "EQ003",
    action: "Retirada",
    date: "2024-02-28",
    returnDate: "2024-03-05",
    project: "Obra Central",
    status: "Devolvido",
  },
  {
    id: 4,
    equipmentName: "Capacete de Segurança",
    equipmentCode: "EQ015",
    action: "Retirada",
    date: "2024-01-15",
    returnDate: null,
    project: "Permanente",
    status: "Em Uso",
  },
]

export function EmployeeHistoryDialog({ open, onOpenChange, employee, onClose }: EmployeeHistoryDialogProps) {
  if (!employee) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em Uso":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Em Uso
          </Badge>
        )
      case "Devolvido":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Devolvido
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const calculateDaysUsed = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto p-4 sm:max-w-4xl sm:w-auto sm:mx-0 sm:p-6">
        <DialogHeader>
          <DialogTitle>Histórico de Equipamentos</DialogTitle>
          <DialogDescription>Histórico completo de utilização de equipamentos</DialogDescription>
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
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Equipamentos Ativos</div>
                  <div className="text-2xl font-bold">{employee.equipmentCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Total de Movimentações</div>
                  <div className="text-2xl font-bold">{equipmentHistory.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Desde</div>
                  <div className="text-lg font-semibold">{formatDate(employee.hireDate)}</div>
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
                    <TableHead>Projeto</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.equipmentName}</TableCell>
                      <TableCell>{item.equipmentCode}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.returnDate ? formatDate(item.returnDate) : "-"}</TableCell>
                      <TableCell>{calculateDaysUsed(item.date, item.returnDate)} dias</TableCell>
                      <TableCell>{item.project}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {equipmentHistory.map((item) => (
                <Card key={item.id} className="p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.equipmentName}</div>
                        <div className="text-xs text-muted-foreground">{item.equipmentCode}</div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Data Retirada:</span>
                        <div className="font-medium">{formatDate(item.date)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Devolução:</span>
                        <div className="font-medium">{item.returnDate ? formatDate(item.returnDate) : "-"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dias de Uso:</span>
                        <div className="font-medium">{calculateDaysUsed(item.date, item.returnDate)} dias</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projeto:</span>
                        <div className="font-medium truncate">{item.project}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
