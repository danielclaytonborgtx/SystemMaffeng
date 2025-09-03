"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface MaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onClose: () => void
}

// Mock data para histórico de manutenções
const maintenanceHistory = [
  {
    id: 1,
    date: "2024-02-15",
    type: "Preventiva",
    description: "Troca de óleo e filtros",
    km: 42000,
    cost: 350.0,
    items: ["Óleo 15W40", "Filtro de óleo", "Filtro de ar"],
    nextMaintenanceKm: 47000,
  },
  {
    id: 2,
    date: "2024-01-10",
    type: "Corretiva",
    description: "Troca de pneus dianteiros",
    km: 40000,
    cost: 1200.0,
    items: ["2x Pneu 295/80R22.5"],
    nextMaintenanceKm: null,
  },
]

const maintenanceTypes = [
  { id: "oleo", name: "Troca de Óleo", intervalKm: 5000 },
  { id: "filtros", name: "Troca de Filtros", intervalKm: 10000 },
  { id: "pneus", name: "Rodízio/Troca de Pneus", intervalKm: 20000 },
  { id: "freios", name: "Revisão de Freios", intervalKm: 15000 },
  { id: "correia", name: "Troca de Correia Dentada", intervalKm: 60000 },
  { id: "revisao", name: "Revisão Geral", intervalKm: 10000 },
]

export function MaintenanceDialog({ open, onOpenChange, vehicle, onClose }: MaintenanceDialogProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history" | "schedule">("new")
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    currentKm: "",
    cost: "",
    items: "",
    nextMaintenanceKm: "",
    observations: "",
  })

  const [scheduledMaintenances, setScheduledMaintenances] = useState(
    maintenanceTypes.map((type) => ({
      ...type,
      enabled: false,
      nextKm: vehicle ? vehicle.currentKm + type.intervalKm : 0,
    })),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registrando manutenção:", formData)
    onClose()
  }

  const handleScheduleToggle = (typeId: string, enabled: boolean) => {
    setScheduledMaintenances((prev) =>
      prev.map((item) => (item.id === typeId ? { ...item, enabled, nextKm: enabled ? item.nextKm : 0 } : item)),
    )
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manutenções - {vehicle.plate}</DialogTitle>
          <DialogDescription>{vehicle.model}</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status do Veículo
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">KM Atual:</span>
                <div className="text-lg font-bold">{vehicle.currentKm?.toLocaleString()} km</div>
              </div>
              <div>
                <span className="font-medium">Próxima Manutenção:</span>
                <div className="text-lg font-bold">{vehicle.maintenanceKm?.toLocaleString()} km</div>
              </div>
              <div>
                <span className="font-medium">Última Manutenção:</span>
                <div className="text-lg font-bold">{new Date(vehicle.lastMaintenance).toLocaleDateString("pt-BR")}</div>
              </div>
              <div>
                <span className="font-medium">Responsável:</span>
                <div className="text-lg font-bold">{vehicle.assignedTo || "Não atribuído"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "new" ? "default" : "ghost"}
            onClick={() => setActiveTab("new")}
            className="rounded-b-none"
          >
            Nova Manutenção
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="rounded-b-none"
          >
            Histórico
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            onClick={() => setActiveTab("schedule")}
            className="rounded-b-none"
          >
            Programar Manutenções
          </Button>
        </div>

        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Manutenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Manutenção</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventiva">Preventiva</SelectItem>
                        <SelectItem value="Corretiva">Corretiva</SelectItem>
                        <SelectItem value="Preditiva">Preditiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentKm">Quilometragem Atual</Label>
                    <Input
                      id="currentKm"
                      type="number"
                      value={formData.currentKm}
                      onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                      placeholder={vehicle.currentKm?.toString()}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da Manutenção</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os serviços realizados..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Custo Total (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextMaintenanceKm">Próxima Manutenção (KM)</Label>
                    <Input
                      id="nextMaintenanceKm"
                      type="number"
                      value={formData.nextMaintenanceKm}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceKm: e.target.value })}
                      placeholder="Ex: 50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="items">Itens Substituídos/Utilizados</Label>
                  <Textarea
                    id="items"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    placeholder="Liste os itens utilizados na manutenção (um por linha)..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Manutenção</Button>
            </div>
          </form>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{new Date(maintenance.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={maintenance.type === "Preventiva" ? "secondary" : "outline"}
                          className={
                            maintenance.type === "Preventiva"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {maintenance.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{maintenance.description}</TableCell>
                      <TableCell>{maintenance.km.toLocaleString()} km</TableCell>
                      <TableCell>R$ {maintenance.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "schedule" && (
          <Card>
            <CardHeader>
              <CardTitle>Programar Manutenções Preventivas</CardTitle>
              <CardDescription>Configure os intervalos de manutenção preventiva para este veículo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={maintenance.enabled}
                        onCheckedChange={(checked) => handleScheduleToggle(maintenance.id, !!checked)}
                      />
                      <div>
                        <div className="font-medium">{maintenance.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Intervalo: {maintenance.intervalKm.toLocaleString()} km
                        </div>
                      </div>
                    </div>
                    {maintenance.enabled && (
                      <div className="text-right">
                        <div className="text-sm font-medium">Próxima em:</div>
                        <div className="text-lg font-bold">{maintenance.nextKm.toLocaleString()} km</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    console.log(
                      "Salvando programação:",
                      scheduledMaintenances.filter((m) => m.enabled),
                    )
                    onClose()
                  }}
                >
                  Salvar Programação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
