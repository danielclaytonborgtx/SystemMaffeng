"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { memo, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { ArrowRight, User, Wrench, Truck, Package, Fuel, Activity } from "lucide-react"

interface Activity {
  id: string
  entityType: string
  entityId: string
  entityName: string
  action: string
  details?: string
  createdAt: Date
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
        
        // Buscar de todas as tabelas da aplicação
        const tables = [
          { name: 'employees', type: 'Colaborador', action: 'foi criado/atualizado' },
          { name: 'equipment', type: 'Equipamento', action: 'foi criado/atualizado' },
          { name: 'vehicles', type: 'Veículo', action: 'foi criado/atualizado' },
          { name: 'equipment_movements', type: 'Movimentação', action: 'foi registrada' },
          { name: 'vehicle_maintenances', type: 'Manutenção', action: 'foi registrada' },
          { name: 'vehicle_fuels', type: 'Abastecimento', action: 'foi registrado' }
        ]
        
        const allActivities: Activity[] = []
        
        for (const table of tables) {
          try {
            // Para equipment_movements, buscar por updated_at também para capturar devoluções
            if (table.name === 'equipment_movements') {
              // Buscar movimentações criadas recentemente
              const { data: movements, error } = await supabase
                .from(table.name)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(2)
              
              if (!error && movements) {
                movements.forEach(movement => {
                  allActivities.push({
                    id: `${table.name}_created_${movement.id}`,
                    entityType: table.type,
                    entityId: movement.id,
                    entityName: movement.equipment_name || `ID: ${movement.id}`,
                    action: 'foi registrada',
                    details: `${movement.type === 'out' ? 'Retirada' : 'Devolução'} de ${movement.equipment_name}`,
                    createdAt: new Date(movement.created_at)
                  })
                })
              }
              
              // Buscar movimentações atualizadas recentemente (devoluções)
              const { data: updatedMovements, error: updateError } = await supabase
                .from(table.name)
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(2)
              
              if (!updateError && updatedMovements) {
                updatedMovements.forEach(movement => {
                  // Só incluir se foi uma devolução (tem actual_return_date e updated_at > created_at)
                  if (movement.actual_return_date && movement.updated_at && movement.created_at) {
                    const updatedTime = new Date(movement.updated_at)
                    const createdTime = new Date(movement.created_at)
                    
                    if (updatedTime.getTime() > createdTime.getTime()) {
                      allActivities.push({
                        id: `${table.name}_updated_${movement.id}`,
                        entityType: table.type,
                        entityId: movement.id,
                        entityName: movement.equipment_name || `ID: ${movement.id}`,
                        action: 'foi devolvido',
                        details: `Devolução de ${movement.equipment_name}`,
                        createdAt: new Date(movement.updated_at)
                      })
                    }
                  }
                })
              }
            } else {
              // Para outras tabelas, buscar tanto por created_at quanto updated_at
              const limitPerQuery = table.name === 'vehicle_maintenances' || table.name === 'vehicle_fuels' ? 2 : 2
              
              // Buscar registros criados recentemente
              const { data: createdData, error: createdError } = await supabase
                .from(table.name)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limitPerQuery)
              
              if (!createdError && createdData) {
                createdData.forEach(item => {
                  let entityName = item.name || item.equipment_name || item.plate || item.vehicle_plate || `ID: ${item.id}`
                  let details = undefined
                  
                  // Personalizar detalhes baseado no tipo de tabela
                  if (table.name === 'vehicle_maintenances') {
                    details = `${item.type || 'Manutenção'} - ${item.description || 'Sem descrição'}`
                  } else if (table.name === 'vehicle_fuels') {
                    details = `${item.liters}L - R$ ${item.cost?.toFixed(2) || '0,00'}`
                  }
                  
                  allActivities.push({
                    id: `${table.name}_created_${item.id}`,
                    entityType: table.type,
                    entityId: item.id,
                    entityName: entityName,
                    action: table.name === 'vehicle_maintenances' ? 'foi registrada' : 
                            table.name === 'vehicle_fuels' ? 'foi registrado' : 'foi criado',
                    details: details,
                    createdAt: new Date(item.created_at)
                  })
                })
              }
              
              // Buscar registros atualizados recentemente (para capturar edições)
              const { data: updatedData, error: updatedError } = await supabase
                .from(table.name)
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(limitPerQuery)
              
              if (!updatedError && updatedData) {
                updatedData.forEach(item => {
                  // Só incluir se foi realmente atualizado (updated_at > created_at)
                  if (item.updated_at && item.created_at) {
                    const updatedTime = new Date(item.updated_at)
                    const createdTime = new Date(item.created_at)
                    
                    // Só incluir se foi atualizado há mais de 1 minuto após criação (para evitar duplicatas)
                    if (updatedTime.getTime() > createdTime.getTime() + 60000) {
                      let entityName = item.name || item.equipment_name || item.plate || item.vehicle_plate || `ID: ${item.id}`
                      let details = undefined
                      
                      if (table.name === 'vehicle_maintenances') {
                        details = `${item.type || 'Manutenção'} - ${item.description || 'Sem descrição'}`
                      } else if (table.name === 'vehicle_fuels') {
                        details = `${item.liters}L - R$ ${item.cost?.toFixed(2) || '0,00'}`
                      }
                      
                      allActivities.push({
                        id: `${table.name}_updated_${item.id}`,
                        entityType: table.type,
                        entityId: item.id,
                        entityName: entityName,
                        action: table.name === 'vehicle_maintenances' ? 'foi atualizada' : 
                                table.name === 'vehicle_fuels' ? 'foi atualizado' : 'foi atualizado',
                        details: details,
                        createdAt: new Date(item.updated_at)
                      })
                    }
                  }
                })
              }
            }
          } catch (tableError) {
            console.error(`Erro ao buscar atividades da tabela ${table.name}:`, tableError)
          }
        }
        
        // Ordenar todas as atividades por data (mais recente primeiro)
        allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        
        // Pegar apenas as 8 mais recentes
        setActivities(allActivities.slice(0, 8))
        
      } catch (err) {
        console.error('Erro ao buscar atividades recentes:', err)
        setError('Erro ao carregar atividades recentes')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Colaborador':
        return <User className="h-4 w-4" />
      case 'Equipamento':
        return <Wrench className="h-4 w-4" />
      case 'Veículo':
        return <Truck className="h-4 w-4" />
      case 'Movimentação':
        return <Package className="h-4 w-4" />
      case 'Manutenção':
        return <Wrench className="h-4 w-4" />
      case 'Abastecimento':
        return <Fuel className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'Colaborador':
        return 'bg-blue-500'
      case 'Equipamento':
        return 'bg-green-500'
      case 'Veículo':
        return 'bg-purple-500'
      case 'Movimentação':
        return 'bg-orange-500'
      case 'Manutenção':
        return 'bg-red-500'
      case 'Abastecimento':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'agora mesmo'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `há ${minutes} min`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `há ${hours}h`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `há ${days} dias`
    }
  }

  if (loading) {
    return (
      <Card className="border shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
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
      <Card className="border shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma atividade recente encontrada
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${getActivityColor(activity.entityType)} text-white`}>
                  {getActivityIcon(activity.entityType)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  <span className="font-semibold">{activity.entityName}</span> {activity.action}
                </p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/dashboard/atividades')}
              className="w-full cursor-pointer"
            >
              Ver Todas as Atividades
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})