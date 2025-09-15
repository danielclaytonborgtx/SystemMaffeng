"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { memo, useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

interface Activity {
  id: string
  entityType: string
  entityId: string
  entityName: string
  action: string
  details?: string
  createdAt: any
}

export const RecentActivity = memo(function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        
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
                limit(2)
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
                limit(2)
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
              const limitPerQuery = col.name === 'vehicleMaintenances' || col.name === 'vehicleFuels' ? 2 : 2
              
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
        
        // Ordenar por data e pegar os 10 mais recentes
        allActivities.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        
        setActivities(allActivities.slice(0, 5))
      } catch (err) {
        setError('Erro ao carregar atividades')
        console.error('Erro ao buscar atividades:', err)
      } finally {
        setLoading(false)
      }
    }

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar atividades</p>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atividade Recente</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/atividades')}
            className="cursor-pointer"
          >
            Ver Tudo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {activity.entityType
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.entityType}</span>{" "}
                <span className="font-medium">{activity.entityName}</span>{" "}
                {activity.action}
                {activity.details && (
                  <span className="text-muted-foreground"> - {activity.details}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
