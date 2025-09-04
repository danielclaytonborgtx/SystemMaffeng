"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VehicleHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
}

export function VehicleHistoryDialog({ open, onOpenChange, vehicle, onClose }: VehicleHistoryDialogProps) {
  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico Completo - {vehicle.plate}</DialogTitle>
          <DialogDescription>{vehicle.model}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenções</TabsTrigger>
            <TabsTrigger value="fuel">Combustível</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Placa:</span>
                    <span className="font-medium">{vehicle.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modelo:</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ano:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={vehicle.status === "Ativo" ? "secondary" : "outline"}
                      className={
                        vehicle.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : vehicle.status === "Manutenção"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quilometragem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Atual:</span>
                    <span className="font-medium">{vehicle.currentKm?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próxima Manutenção:</span>
                    <span className="font-medium">{vehicle.maintenanceKm?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restam:</span>
                    <span className="font-medium">
                      {(vehicle.maintenanceKm - vehicle.currentKm).toLocaleString()} km
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Médio:</span>
                    <span className="font-medium">{vehicle.fuelConsumption} km/l</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsável:</span>
                    <span className="font-medium">{vehicle.assignedTo || "Não atribuído"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Manutenções</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Histórico detalhado de manutenções será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fuel">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Histórico detalhado de abastecimentos será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Análise detalhada de custos será exibida aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
