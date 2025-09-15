"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, Wrench, Fuel, AlertTriangle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog"
import { MaintenanceDialog } from "@/components/vehicles/maintenance-dialog"
import { FuelDialog } from "@/components/vehicles/fuel-dialog"
import { VehicleHistoryDialog } from "@/components/vehicles/vehicle-history-dialog"
import { useVehicles } from "@/hooks"
import { Vehicle } from "@/lib/firestore"

export default function VeiculosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const { data: vehicles, loading, error, refetch } = useVehicles()

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return []
    
    return vehicles.filter((vehicle: Vehicle) => {
      const matchesSearch =
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      const matchesType = typeFilter === "all" || vehicle.brand === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [vehicles, searchTerm, statusFilter, typeFilter])

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!vehicles) return { total: 0, active: 0, maintenance: 0 }
    
    return {
      total: vehicles.length,
      active: vehicles.filter(veh => veh.status === 'active').length,
      maintenance: vehicles.filter(veh => veh.status === 'maintenance').length,
    }
  }, [vehicles])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Manutenção
          </Badge>
        )
      case "retired":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Aposentado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isMaintenanceDue = (vehicle: any) => {
    const nextMaintenanceDate = new Date(vehicle.nextMaintenance)
    const today = new Date()
    const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilMaintenance <= 7 || vehicle.currentKm >= vehicle.maintenanceKm
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground">Gerencie a frota de veículos</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar veículos: {error}</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground">Gerencie a frota e manutenções</p>
        </div>
        <Button onClick={() => {
          setSelectedVehicle(null)
          setIsVehicleDialogOpen(true)
        }} className="cursor-pointer w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">Total de Veículos</p>
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
                placeholder="Buscar por placa ou modelo..."
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
                <SelectItem value="maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Caminhão">Caminhão</SelectItem>
                <SelectItem value="Caminhonete">Caminhonete</SelectItem>
                <SelectItem value="Escavadeira">Escavadeira</SelectItem>
                <SelectItem value="Trator">Trator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frota de Veículos</CardTitle>
          <CardDescription>{filteredVehicles.length} veículo(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo de Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KM Atual</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Carregando veículos...</p>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum veículo encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle: Vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(vehicle.status)}
                      {isMaintenanceDue(vehicle) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.currentKm ? vehicle.currentKm.toLocaleString('pt-BR') + ' km' : '-'}</TableCell>
                  <TableCell>{vehicle.maintenanceKm ? vehicle.maintenanceKm.toLocaleString('pt-BR') + ' km' : '-'}</TableCell>
                  <TableCell>{vehicle.assignedTo || 'Não atribuído'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsVehicleDialogOpen(true)
                        }}
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsMaintenanceDialogOpen(true)
                        }}
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Wrench className="h-4 w-4 text-yellow-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsFuelDialogOpen(true)
                        }}
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Fuel className="h-4 w-4 text-green-600" />
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
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{vehicle.model}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {vehicle.plate} • {vehicle.brand}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {vehicle.status}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(vehicle.status)}
                      {isMaintenanceDue(vehicle) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsVehicleDialogOpen(true)
                        }}
                        className="cursor-pointer h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsMaintenanceDialogOpen(true)
                        }}
                        className="cursor-pointer h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Wrench className="h-3 w-3 text-yellow-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsFuelDialogOpen(true)
                        }}
                        className="cursor-pointer h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Fuel className="h-3 w-3 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">KM Atual:</span>
                      <div className="font-medium">{vehicle.currentKm ? vehicle.currentKm.toLocaleString('pt-BR') + ' km' : '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próxima Manutenção:</span>
                      <div className="font-medium">{vehicle.maintenanceKm ? vehicle.maintenanceKm.toLocaleString('pt-BR') + ' km' : '-'}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Responsável:</span>
                      <div className="font-medium">{vehicle.assignedTo || 'Não atribuído'}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <VehicleDialog
        open={isVehicleDialogOpen}
        onOpenChange={setIsVehicleDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsVehicleDialogOpen(false)
        }}
        onSuccess={() => {
          refetch() // Recarregar a lista de veículos
        }}
      />

      <MaintenanceDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsMaintenanceDialogOpen(false)
        }}
        onSuccess={() => {
          refetch() // Recarregar a lista de veículos
        }}
      />

      <FuelDialog
        open={isFuelDialogOpen}
        onOpenChange={setIsFuelDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsFuelDialogOpen(false)
        }}
        onSuccess={() => {
          refetch() // Recarregar a lista de veículos
        }}
      />

      <VehicleHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsHistoryDialogOpen(false)
        }}
      />
    </div>
  )
}
