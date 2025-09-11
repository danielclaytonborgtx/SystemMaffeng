"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, ArrowUpDown, Loader2, Package, Hash, Wrench, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EquipmentDialog } from "@/components/equipments/equipment-dialog"
import { MovementDialog } from "@/components/equipments/movement-dialog"
import { useEquipment } from "@/hooks"
import { Equipment } from "@/lib/firestore"

export default function EquipamentosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const { data: equipments, loading, error, refetch } = useEquipment()

  const filteredEquipments = useMemo(() => {
    if (!equipments) return []
    
    return equipments.filter((equipment) => {
      const matchesSearch =
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || equipment.status === statusFilter
      const matchesType = typeFilter === "all" || equipment.category === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [equipments, searchTerm, statusFilter, typeFilter])

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!equipments) return { total: 0, available: 0, inUse: 0, maintenance: 0 }
    
    return {
      total: equipments.length,
      available: equipments.filter(eq => eq.status === 'available').length,
      inUse: equipments.filter(eq => eq.status === 'in_use').length,
      maintenance: equipments.filter(eq => eq.status === 'maintenance').length,
    }
  }, [equipments])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Disponível
          </Badge>
        )
      case "in_use":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Em Uso
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Manutenção
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
    }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Equipamentos</h1>
            <p className="text-muted-foreground">Gerencie os equipamentos e suas movimentações</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar equipamentos: {error}</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie o estoque de equipamentos</p>
        </div>
        <Button onClick={() => {
          setSelectedEquipment(null)
          setIsEquipmentDialogOpen(true)
        }} className="cursor-pointer w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">Total de Equipamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.available}
            </div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inUse}
            </div>
            <p className="text-xs text-muted-foreground">Em Uso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.maintenance}
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
                <SelectItem value="Ferramenta Elétrica">Ferramenta Elétrica</SelectItem>
                <SelectItem value="Ferramenta Pneumática">Ferramenta Pneumática</SelectItem>
                <SelectItem value="Equipamento de Segurança">Ferramentas Manuais</SelectItem>
                <SelectItem value="Equipamento de Segurança">Ferramentas Descartáveis</SelectItem>
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
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Carregando equipamentos...</p>
                  </TableCell>
                </TableRow>
              ) : filteredEquipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum equipamento encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {equipment.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{equipment.category}</TableCell>
                  <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                  <TableCell>{equipment.location}</TableCell>
                  <TableCell>{equipment.assignedTo || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsEquipmentDialogOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsMovementDialogOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
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
            {filteredEquipments.map((equipment) => (
              <Card key={equipment.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{equipment.name}</div>
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
                      Responsável: {equipment.assignedTo || 'Nenhum'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(equipment.status)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsEquipmentDialogOpen(true)
                        }}
                        className="cursor-pointer h-8 w-8"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setIsMovementDialogOpen(true)
                        }}
                        className="cursor-pointer h-8 w-8"
                      >
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Categoria:</span>
                    <span className="text-sm font-medium">{equipment.category}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
        onSuccess={() => {
          refetch() // Recarregar a lista de equipamentos
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
        onSuccess={() => {
          refetch() // Recarregar a lista de equipamentos
        }}
      />
    </div>
  )
}
