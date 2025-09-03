"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, Wrench, Fuel, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog"
import { MaintenanceDialog } from "@/components/vehicles/maintenance-dialog"
import { FuelDialog } from "@/components/vehicles/fuel-dialog"
import { VehicleHistoryDialog } from "@/components/vehicles/vehicle-history-dialog"

// Mock data para demonstração
const vehicles = [
  {
    id: 1,
    plate: "ABC-1234",
    model: "Volvo FH 540",
    type: "Caminhão",
    year: 2022,
    currentKm: 45000,
    status: "Ativo",
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-04-15",
    maintenanceKm: 50000,
    fuelConsumption: 3.2,
    assignedTo: "João Silva",
    maintenanceAlerts: 1,
  },
  {
    id: 2,
    plate: "XYZ-5678",
    model: "Caterpillar 320D",
    type: "Escavadeira",
    year: 2021,
    currentKm: 2800,
    status: "Manutenção",
    lastMaintenance: "2024-03-01",
    nextMaintenance: "2024-06-01",
    maintenanceKm: 3000,
    fuelConsumption: 15.5,
    assignedTo: null,
    maintenanceAlerts: 0,
  },
  {
    id: 3,
    plate: "DEF-9012",
    model: "Ford Ranger XLT",
    type: "Caminhonete",
    year: 2023,
    currentKm: 12000,
    status: "Ativo",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    maintenanceKm: 15000,
    fuelConsumption: 8.5,
    assignedTo: "Maria Santos",
    maintenanceAlerts: 0,
  },
]

export default function VeiculosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        )
      case "Manutenção":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Manutenção
          </Badge>
        )
      case "Inativo":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Inativo
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

  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.status === "Ativo").length
  const inMaintenance = vehicles.filter((v) => v.status === "Manutenção").length
  const maintenanceAlerts = vehicles.filter((v) => isMaintenanceDue(v)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground">Gerencie a frota e manutenções</p>
        </div>
        <Button onClick={() => setIsVehicleDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Total de Veículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">{inMaintenance}</div>
            <p className="text-xs text-muted-foreground">Em Manutenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{maintenanceAlerts}</div>
            <p className="text-xs text-muted-foreground">Alertas de Manutenção</p>
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
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KM Atual</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(vehicle.status)}
                      {isMaintenanceDue(vehicle) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" title="Manutenção vencida ou próxima" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.currentKm.toLocaleString()} km</TableCell>
                  <TableCell>{new Date(vehicle.nextMaintenance).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{vehicle.assignedTo || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsVehicleDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsMaintenanceDialogOpen(true)
                        }}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setIsFuelDialogOpen(true)
                        }}
                      >
                        <Fuel className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      />

      <MaintenanceDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null)
          setIsMaintenanceDialogOpen(false)
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
