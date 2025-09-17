"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Calendar, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEmployees, useEquipment, useVehicles, useEquipmentMovements, useVehicleMaintenances, useVehicleFuels } from "@/hooks"

interface Activity {
  id: string
  entityType: string
  entityId: string
  entityName: string
  action: string
  details?: string
  createdAt: any
}

export default function AtividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const router = useRouter()

  // Usar hooks padronizados
  const { data: employees, loading: employeesLoading } = useEmployees()
  const { data: equipment, loading: equipmentLoading } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading } = useVehicles()
  const { data: movements, loading: movementsLoading } = useEquipmentMovements()
  const { data: maintenances, loading: maintenancesLoading } = useVehicleMaintenances()
  const { data: fuels, loading: fuelsLoading } = useVehicleFuels()

  // Loading geral - qualquer hook carregando
  const loading = employeesLoading || equipmentLoading || vehiclesLoading || movementsLoading || maintenancesLoading || fuelsLoading

  // Função para processar atividades dos dados dos hooks
  const processActivities = () => {
    const allActivities: Activity[] = []
    
    // Processar colaboradores
    employees.forEach(emp => {
      allActivities.push({
        id: `employee_${emp.id}`,
        entityType: 'Colaborador',
        entityId: emp.id || '',
        entityName: emp.name,
        action: 'foi criado',
        details: `${emp.position} - ${emp.department}`,
        createdAt: emp.createdAt
      })
    })
    
    // Processar equipamentos
    equipment.forEach(eq => {
      allActivities.push({
        id: `equipment_${eq.id}`,
        entityType: 'Equipamento',
        entityId: eq.id || '',
        entityName: eq.name,
        action: 'foi criado',
        details: `${eq.category} - ${eq.status}`,
        createdAt: eq.createdAt
      })
    })
    
    // Processar veículos
    vehicles.forEach(veh => {
      allActivities.push({
        id: `vehicle_${veh.id}`,
        entityType: 'Veículo',
        entityId: veh.id || '',
        entityName: `${veh.plate} - ${veh.model}`,
        action: 'foi criado',
        details: `${veh.brand} - ${veh.status}`,
        createdAt: veh.createdAt
      })
    })
    
    // Processar movimentações
    movements.forEach(mov => {
      allActivities.push({
        id: `movement_${mov.id}`,
        entityType: 'Movimentação',
        entityId: mov.id || '',
        entityName: mov.equipmentName,
        action: mov.type === 'out' ? 'foi retirado' : 'foi devolvido',
        details: `${mov.employeeName} - ${mov.project}`,
        createdAt: mov.createdAt
      })
    })
    
    // Processar manutenções
    maintenances.forEach(maint => {
      allActivities.push({
        id: `maintenance_${maint.id}`,
        entityType: 'Manutenção',
        entityId: maint.id || '',
        entityName: `${maint.vehiclePlate} - ${maint.vehicleModel}`,
        action: 'foi registrada',
        details: `${maint.type} - R$ ${maint.cost?.toFixed(2) || '0,00'}`,
        createdAt: maint.createdAt
      })
    })
    
    // Processar abastecimentos
    fuels.forEach(fuel => {
      allActivities.push({
        id: `fuel_${fuel.id}`,
        entityType: 'Abastecimento',
        entityId: fuel.id || '',
        entityName: `${fuel.vehiclePlate} - ${fuel.vehicleModel}`,
        action: 'foi registrado',
        details: `${fuel.liters}L - R$ ${fuel.cost?.toFixed(2) || '0,00'}`,
        createdAt: fuel.createdAt
      })
    })
    
    // Ordenar por data (mais recente primeiro)
    allActivities.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    
    return allActivities
  }

  // Processar atividades quando os dados dos hooks mudarem
  useEffect(() => {
    if (!loading) {
      const processedActivities = processActivities()
      setActivities(processedActivities)
    }
  }, [employees, equipment, vehicles, movements, maintenances, fuels, loading])

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Agora"
    
    const now = new Date()
    const activityDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Data não disponível"
    
    const activityDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return activityDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || activity.entityType === typeFilter
    const matchesAction = actionFilter === "all" || activity.action.includes(actionFilter)
    
    return matchesSearch && matchesType && matchesAction
  })

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'Colaborador': return 'bg-blue-100 text-blue-800'
      case 'Equipamento': return 'bg-green-100 text-green-800'
      case 'Veículo': return 'bg-purple-100 text-purple-800'
      case 'Movimentação': return 'bg-orange-100 text-orange-800'
      case 'Manutenção': return 'bg-yellow-100 text-yellow-800'
      case 'Abastecimento': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Se ainda está carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Todas as Atividades</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Equipamento">Equipamento</SelectItem>
                  <SelectItem value="Veículo">Veículo</SelectItem>
                  <SelectItem value="Movimentação">Movimentação</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Abastecimento">Abastecimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ação</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="criado">Criado</SelectItem>
                  <SelectItem value="atualizado">Atualizado</SelectItem>
                  <SelectItem value="registrada">Registrada</SelectItem>
                  <SelectItem value="registrado">Registrado</SelectItem>
                  <SelectItem value="devolvido">Devolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Atividades ({filteredActivities.length})</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ordenado por data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="cursor-pointer">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || typeFilter !== "all" || actionFilter !== "all" 
                ? "Nenhuma atividade encontrada com os filtros aplicados"
                : "Nenhuma atividade encontrada"
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={getEntityTypeColor(activity.entityType)}>
                      {activity.entityType
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          <span className="font-semibold">{activity.entityType}</span>{" "}
                          <span className="font-semibold text-blue-600">{activity.entityName}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>
                        </p>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{formatTimeAgo(activity.createdAt)}</div>
                        <div>{formatDate(activity.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
