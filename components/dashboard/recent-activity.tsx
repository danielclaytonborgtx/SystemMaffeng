import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { memo, useMemo } from "react"

export const RecentActivity = memo(function RecentActivity() {
  const activities = useMemo(() => [
    {
      id: 1,
      user: "João Silva",
      action: "retirou",
      item: "Furadeira Bosch GSB 550",
      time: "10 min atrás",
    },
    {
      id: 2,
      user: "Maria Santos",
      action: "devolveu",
      item: "Martelo Pneumático",
      time: "25 min atrás",
    },
    {
      id: 3,
      user: "Carlos Oliveira",
      action: "cadastrou",
      item: "Serra Circular Makita",
      time: "1 hora atrás",
    },
    {
      id: 4,
      user: "Ana Costa",
      action: "agendou manutenção",
      item: "Caminhão Volvo FH-540",
      time: "2 horas atrás",
    },
  ], [])

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
                {activity.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                <span className="font-medium">{activity.item}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
