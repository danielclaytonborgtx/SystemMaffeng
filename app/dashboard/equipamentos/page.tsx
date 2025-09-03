"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EquipmentDialog } from "@/components/equipments/equipment-dialog"
import { MovementDialog } from "@/components/equipments/movement-dialog"

// Mock data para demonstração
const equipments = [
  {
    id: 1,
    name: "Furadeira Bosch GSB 550",
    type: "Ferramenta Elétrica",
    code: "EQ001",
    value: 299.99,
    status: "Disponível",
    location: "Almoxarifado A",
    assignedTo: null,
    purchaseDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Martelo Pneumático Makita",
    type: "Ferramenta Pneumática",
    code: "EQ002",
    value: 1299.99,
    status: "Em Uso",
    location: "Obra Central",
    assignedTo: "João Silva",
    purchaseDate: "2024-02-10",
  },
  {
    id: 3,
    name: "Serra Circular Dewalt",
    type: "Ferramenta Elétrica",
    code: "EQ003",
    value: 599.99,
    status: "Manutenção",
    location: "Oficina",
    assignedTo: null,
    purchaseDate: "2024-01-20",
  },
]

export default function EquipamentosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || equipment.status === statusFilter
    const matchesType = typeFilter === "all" || equipment.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disponível":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Disponível
          </Badge>
        )
      case "Em Uso":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Em Uso
          </Badge>
        )
      case "Manutenção":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Manutenção
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie o estoque de equipamentos</p>
        </div>
        <Button onClick={() => setIsEquipmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
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
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em Uso">Em Uso</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Ferramenta Elétrica">Ferramenta Elétrica</SelectItem>
                <SelectItem value="Ferramenta Pneumática">Ferramenta Pneumática</SelectItem>
                <SelectItem value="Equipamento de Segurança">Equipamento de Segurança</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipamentos</CardTitle>
          <CardDescription>{filteredEquipments.length} equipamento(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.code}</TableCell>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>{equipment.type}</TableCell>
                  <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                  <TableCell>R$ {equipment.value.toFixed(2)}</TableCell>
                  <TableCell>{equipment.assignedTo || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsEquipmentDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsMovementDialogOpen(true)
                        }}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EquipmentDialog
        open={isEquipmentDialogOpen}
        onOpenChange={setIsEquipmentDialogOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null)
          setIsEquipmentDialogOpen(false)
        }}
      />

      <MovementDialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null)
          setIsMovementDialogOpen(false)
        }}
      />
    </div>
  )
}
