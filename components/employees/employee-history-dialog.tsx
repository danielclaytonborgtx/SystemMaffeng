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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Equipamentos</DialogTitle>
          <DialogDescription>Histórico completo de utilização de equipamentos</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
