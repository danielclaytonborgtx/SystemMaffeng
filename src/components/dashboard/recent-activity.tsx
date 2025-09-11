"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { memo, useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar das principais coleções
        const collections = [
          { name: 'employees', type: 'Colaborador', action: 'foi criado/atualizado' },
          { name: 'equipment', type: 'Equipamento', action: 'foi criado/atualizado' },
          { name: 'vehicles', type: 'Veículo', action: 'foi criado/atualizado' },
          { name: 'equipmentMovements', type: 'Movimentação', action: 'foi registrada' }
        ]
        
        const allActivities: Activity[] = []
        
        for (const col of collections) {
          try {
            const q = query(
              collection(db, col.name),
              orderBy('createdAt', 'desc'),
              limit(3) // 3 de cada coleção para ter 12 no total
            )
            const querySnapshot = await getDocs(q)
            
            querySnapshot.docs.forEach(doc => {
              const data = doc.data()
              allActivities.push({
                id: `${col.name}_${doc.id}`,
                entityType: col.type,
                entityId: doc.id,
                entityName: data.name || data.equipmentName || data.plate || `ID: ${doc.id}`,
                action: col.action,
                details: col.name === 'equipmentMovements' ? 
                  `${data.type === 'out' ? 'Retirada' : 'Devolução'} de ${data.equipmentName}` : 
                  undefined,
                createdAt: data.createdAt || data.updatedAt
              })
            })
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
        
        setActivities(allActivities.slice(0, 10))
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
          {Array.from({ length: 4 }).map((_, i) => (
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
        <CardTitle>Atividade Recente</CardTitle>
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
