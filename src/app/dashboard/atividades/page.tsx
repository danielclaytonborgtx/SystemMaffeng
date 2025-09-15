"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { collection, query, orderBy, getDocs, limit, startAfter, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Search, Filter, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const router = useRouter()

  const fetchActivities = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true)
        setError(null)
      }
      
      // Buscar de todas as coleções da aplicação
      const collections = [
        { name: 'employees', type: 'Colaborador', action: 'foi criado/atualizado' },
        { name: 'equipment', type: 'Equipamento', action: 'foi criado/atualizado' },
        { name: 'vehicles', type: 'Veículo', action: 'foi criado/atualizado' },
        { name: 'equipmentMovements', type: 'Movimentação', action: 'foi registrada' },
        { name: 'vehicleMaintenances', type: 'Manutenção', action: 'foi registrada' },
        { name: 'vehicleFuels', type: 'Abastecimento', action: 'foi registrado' }
      ]
      
      const allActivities: Activity[] = []
      
      for (const col of collections) {
        try {
          // Para equipmentMovements, buscar por updatedAt também para capturar devoluções
          if (col.name === 'equipmentMovements') {
            // Buscar movimentações criadas recentemente
            const qCreated = query(
              collection(db, col.name),
              orderBy('createdAt', 'desc'),
              limit(loadMore ? 5 : 10)
            )
            const createdSnapshot = await getDocs(qCreated)
            
            createdSnapshot.docs.forEach(doc => {
              const data = doc.data()
              allActivities.push({
                id: `${col.name}_created_${doc.id}`,
                entityType: col.type,
                entityId: doc.id,
                entityName: data.equipmentName || `ID: ${doc.id}`,
                action: 'foi registrada',
                details: `${data.type === 'out' ? 'Retirada' : 'Devolução'} de ${data.equipmentName}`,
                createdAt: data.createdAt
              })
            })
            
            // Buscar movimentações atualizadas recentemente (devoluções)
            const qUpdated = query(
              collection(db, col.name),
              orderBy('updatedAt', 'desc'),
              limit(loadMore ? 5 : 10)
            )
            const updatedSnapshot = await getDocs(qUpdated)
            
            updatedSnapshot.docs.forEach(doc => {
              const data = doc.data()
              // Só incluir se foi uma devolução (tem actualReturnDate e updatedAt > createdAt)
              if (data.actualReturnDate && data.updatedAt && data.createdAt) {
                const updatedTime = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
                const createdTime = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                
                if (updatedTime.getTime() > createdTime.getTime()) {
                  allActivities.push({
                    id: `${col.name}_updated_${doc.id}`,
                    entityType: col.type,
                    entityId: doc.id,
                    entityName: data.equipmentName || `ID: ${doc.id}`,
                    action: 'foi devolvido',
                    details: `Devolução de ${data.equipmentName}`,
                    createdAt: data.updatedAt
                  })
                }
              }
            })
          } else {
            // Para outras coleções, buscar tanto por createdAt quanto updatedAt
            const limitPerQuery = loadMore ? 5 : 10
            
            // Buscar registros criados recentemente
            const qCreated = query(
              collection(db, col.name),
              orderBy('createdAt', 'desc'),
              limit(limitPerQuery)
            )
            const createdSnapshot = await getDocs(qCreated)
            
            createdSnapshot.docs.forEach(doc => {
              const data = doc.data()
              let entityName = data.name || data.equipmentName || data.plate || data.vehiclePlate || `ID: ${doc.id}`
              let details = undefined
              
              // Personalizar detalhes baseado no tipo de coleção
              if (col.name === 'vehicleMaintenances') {
                details = `${data.type || 'Manutenção'} - ${data.description || 'Sem descrição'}`
              } else if (col.name === 'vehicleFuels') {
                details = `${data.liters}L - R$ ${data.cost?.toFixed(2) || '0,00'}`
              }
              
              allActivities.push({
                id: `${col.name}_created_${doc.id}`,
                entityType: col.type,
                entityId: doc.id,
                entityName: entityName,
                action: col.name === 'vehicleMaintenances' ? 'foi registrada' : 
                        col.name === 'vehicleFuels' ? 'foi registrado' : 'foi criado',
                details: details,
                createdAt: data.createdAt
              })
            })
            
            // Buscar registros atualizados recentemente (para capturar edições)
            const qUpdated = query(
              collection(db, col.name),
              orderBy('updatedAt', 'desc'),
              limit(limitPerQuery)
            )
            const updatedSnapshot = await getDocs(qUpdated)
            
            updatedSnapshot.docs.forEach(doc => {
              const data = doc.data()
              // Só incluir se foi realmente atualizado (updatedAt > createdAt)
              if (data.updatedAt && data.createdAt) {
                const updatedTime = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
                const createdTime = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                
                // Só incluir se foi atualizado há mais de 1 minuto após criação (para evitar duplicatas)
                if (updatedTime.getTime() > createdTime.getTime() + 60000) {
                  let entityName = data.name || data.equipmentName || data.plate || data.vehiclePlate || `ID: ${doc.id}`
                  let details = undefined
                  
                  if (col.name === 'vehicleMaintenances') {
                    details = `${data.type || 'Manutenção'} - ${data.description || 'Sem descrição'}`
                  } else if (col.name === 'vehicleFuels') {
                    details = `${data.liters}L - R$ ${data.cost?.toFixed(2) || '0,00'}`
                  }
                  
                  allActivities.push({
                    id: `${col.name}_updated_${doc.id}`,
                    entityType: col.type,
                    entityId: doc.id,
                    entityName: entityName,
                    action: col.name === 'vehicleMaintenances' ? 'foi atualizada' : 
                            col.name === 'vehicleFuels' ? 'foi atualizado' : 'foi atualizado',
                    details: details,
                    createdAt: data.updatedAt
                  })
                }
              }
            })
          }
        } catch (colError) {
          console.warn(`Erro ao buscar ${col.name}:`, colError)
        }
      }
      
      // Ordenar por data
      allActivities.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      if (loadMore) {
        setActivities(prev => [...prev, ...allActivities])
      } else {
        setActivities(allActivities)
      }
      
      setHasMore(allActivities.length > 0)
    } catch (err) {
      setError('Erro ao carregar atividades')
      console.error('Erro ao buscar atividades:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

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

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Todas as Atividades</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <Button onClick={() => fetchActivities()} className="cursor-pointer">
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
              
              {hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchActivities(true)}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {loading ? "Carregando..." : "Carregar Mais"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
