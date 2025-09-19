"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Wrench, Shield, FileText, Bell, ArrowRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVehicles } from "@/hooks"
import { useRouter } from "next/navigation"

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: vehicles } = useVehicles()
  const router = useRouter()

  const notifications = useMemo(() => {
    const notificationsList: any[] = []
    const today = new Date()
    
    console.log('NotificationsDropdown: Processando notificações para veículos:', vehicles.length)
    
    // Notificações de manutenção por quilometragem e data
    vehicles.forEach(vehicle => {
      if (vehicle.current_km && vehicle.maintenance_km) {
        const kmUntilMaintenance = vehicle.maintenance_km - vehicle.current_km
        
        // Notificação por quilometragem (1000km antes da manutenção)
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          notificationsList.push({
            id: `maintenance-km-${vehicle.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Próxima por KM",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Faltam ${kmUntilMaintenance} km para manutenção`,
            time: "Agora",
          })
        } else if (kmUntilMaintenance <= 0) {
          notificationsList.push({
            id: `maintenance-overdue-km-${vehicle.id}`,
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Vencida por KM",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Manutenção vencida há ${Math.abs(kmUntilMaintenance)} km`,
            time: "Urgente",
          })
        }
      }
      
      // Notificação por data (se existir next_maintenance)
      if (vehicle.next_maintenance) {
        const nextMaintenanceDate = new Date(vehicle.next_maintenance)
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilMaintenance < 0) {
          notificationsList.push({
            id: `maintenance-overdue-date-${vehicle.id}`,
            type: "urgent",
            icon: AlertTriangle,
            title: "Manutenção Vencida por Data",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Manutenção vencida há ${Math.abs(daysUntilMaintenance)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilMaintenance <= 7) {
          notificationsList.push({
            id: `maintenance-due-date-${vehicle.id}`,
            type: "warning",
            icon: Clock,
            title: "Manutenção Próxima por Data",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Revisão em ${daysUntilMaintenance} dias`,
            time: "Atenção",
          })
        }
      }
    })

    // Notificações de seguro vencido
    vehicles.forEach(vehicle => {
      if (vehicle.insurance_expiry) {
        const insuranceDate = new Date(vehicle.insurance_expiry)
        const daysUntilInsurance = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilInsurance < 0) {
          notificationsList.push({
            id: `insurance-overdue-${vehicle.id}`,
            type: "urgent",
            icon: Shield,
            title: "Seguro Vencido",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Seguro vencido há ${Math.abs(daysUntilInsurance)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilInsurance <= 30) {
          notificationsList.push({
            id: `insurance-due-${vehicle.id}`,
            type: "warning",
            icon: Shield,
            title: "Seguro Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Seguro vence em ${daysUntilInsurance} dias`,
            time: "Atenção",
          })
        }
      }
    })

    // Notificações de licenciamento próximo
    vehicles.forEach(vehicle => {
      if (vehicle.license_expiry) {
        const licenseDate = new Date(vehicle.license_expiry)
        const daysUntilLicense = Math.ceil((licenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilLicense < 0) {
          notificationsList.push({
            id: `license-overdue-${vehicle.id}`,
            type: "urgent",
            icon: FileText,
            title: "Licenciamento Vencido",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Licenciamento vencido há ${Math.abs(daysUntilLicense)} dias`,
            time: "Urgente",
          })
        } else if (daysUntilLicense <= 30) {
          notificationsList.push({
            id: `license-due-${vehicle.id}`,
            type: "warning",
            icon: FileText,
            title: "Licenciamento Próximo do Vencimento",
            description: `${vehicle.plate} - ${vehicle.model}`,
            detail: `Licenciamento vence em ${daysUntilLicense} dias`,
            time: "Atenção",
          })
        }
      }
    })
    
    // Ordenar notificações por prioridade (urgent primeiro, depois warning)
    const sortedNotifications = notificationsList.sort((a: any, b: any) => {
      const priority: { [key: string]: number } = { urgent: 0, warning: 1 }
      return priority[a.type] - priority[b.type]
    })
    
    console.log('NotificationsDropdown: Total de notificações geradas:', sortedNotifications.length)
    console.log('NotificationsDropdown: Notificações:', sortedNotifications)
    
    return sortedNotifications.slice(0, 5) // Limitar a 5 notificações
  }, [vehicles])

  const urgentCount = notifications.filter(n => n.type === "urgent").length
  const warningCount = notifications.filter(n => n.type === "warning").length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer relative">
          <Bell className="h-5 w-5" />
          {(urgentCount > 0 || warningCount > 0) && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {urgentCount + warningCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={12}>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
              {(urgentCount > 0 || warningCount > 0) && (
                <Badge variant="secondary" className="ml-auto">
                  {urgentCount + warningCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex items-start gap-3 p-4 border-b last:border-b-0"
                    >
                      <div className={`p-2 rounded-full ${
                        notification.type === "urgent"
                          ? "bg-red-500/20"
                          : "bg-yellow-500/20"
                      }`}>
                        <notification.icon
                          className={`h-4 w-4 ${
                            notification.type === "urgent"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 max-w-[calc(100%-3rem)]">
                        <div className="flex items-start gap-2 mb-1">
                          <p className="font-medium text-sm break-words leading-tight">{notification.title}</p>
                          <Badge
                            className={`flex-shrink-0 ${
                              notification.type === "urgent" 
                                ? "bg-red-500 text-white" 
                                : "bg-yellow-500 text-white"
                            }`}
                          >
                            {notification.type === "urgent" ? "Urgente" : "Atenção"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-words leading-tight mb-1">{notification.description}</p>
                        <p className="text-xs text-muted-foreground break-words leading-tight">{notification.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="px-2 pt-2 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    router.push('/dashboard/alertas')
                    setIsOpen(false)
                  }}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-0"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Ver Todos os Alertas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
