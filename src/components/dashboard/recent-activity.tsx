"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  User,
  Wrench,
  Truck,
  Package,
  Fuel,
  Activity,
} from "lucide-react";
import {
  useEmployeesQuery,
  useEquipmentQuery,
  useVehiclesQuery,
  useEquipmentMovementsQuery,
  useVehicleMaintenancesQuery,
  useVehicleFuelsQuery,
} from "@/hooks";

interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  details?: string;
  createdAt: Date;
}

export const RecentActivity = memo(function RecentActivity() {
  const router = useRouter();

  // Usar hooks do React Query para buscar dados
  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployeesQuery();
  const {
    data: equipment = [],
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useEquipmentQuery();
  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useVehiclesQuery();
  const {
    data: movements = [],
    isLoading: movementsLoading,
    error: movementsError,
  } = useEquipmentMovementsQuery();
  const {
    data: maintenances = [],
    isLoading: maintenancesLoading,
    error: maintenancesError,
  } = useVehicleMaintenancesQuery();
  const {
    data: fuels = [],
    isLoading: fuelsLoading,
    error: fuelsError,
  } = useVehicleFuelsQuery();

  const loading =
    employeesLoading ||
    equipmentLoading ||
    vehiclesLoading ||
    movementsLoading ||
    maintenancesLoading ||
    fuelsLoading;
  const error =
    employeesError ||
    equipmentError ||
    vehiclesError ||
    movementsError ||
    maintenancesError ||
    fuelsError;

  // Gerar atividades baseadas nos dados em cache
  const activities = useMemo(() => {
    const allActivities: Activity[] = [];

    // Atividades de colaboradores (últimos 2)
    employees.slice(0, 2).forEach((employee) => {
      allActivities.push({
        id: `employee_${employee.id}`,
        entityType: "Colaborador",
        entityId: employee.id,
        entityName: employee.name,
        action: "foi criado/atualizado",
        details: `${employee.position} - ${employee.department}`,
        createdAt: new Date(employee.created_at),
      });
    });

    // Atividades de equipamentos (últimos 2)
    equipment.slice(0, 2).forEach((eq) => {
      allActivities.push({
        id: `equipment_${eq.id}`,
        entityType: "Equipamento",
        entityId: eq.id,
        entityName: eq.name,
        action: "foi criado/atualizado",
        details: `${eq.category} - ${eq.status}`,
        createdAt: new Date(eq.created_at),
      });
    });

    // Atividades de veículos (últimos 2)
    vehicles.slice(0, 2).forEach((vehicle) => {
      allActivities.push({
        id: `vehicle_${vehicle.id}`,
        entityType: "Veículo",
        entityId: vehicle.id,
        entityName: vehicle.plate,
        action: "foi criado/atualizado",
        details: `${vehicle.brand} ${vehicle.model}`,
        createdAt: new Date(vehicle.created_at),
      });
    });

    // Atividades de movimentações (últimos 2)
    movements.slice(0, 2).forEach((movement) => {
      allActivities.push({
        id: `movement_${movement.id}`,
        entityType: "Movimentação",
        entityId: movement.id,
        entityName: movement.equipment_name || `ID: ${movement.id}`,
        action: "foi registrada",
        details: `${movement.type === "out" ? "Retirada" : "Devolução"} de ${
          movement.equipment_name
        }`,
        createdAt: new Date(movement.created_at),
      });
    });

    // Atividades de manutenções (últimos 2)
    maintenances.slice(0, 2).forEach((maintenance) => {
      allActivities.push({
        id: `maintenance_${maintenance.id}`,
        entityType: "Manutenção",
        entityId: maintenance.id,
        entityName: maintenance.vehicle_plate || `ID: ${maintenance.id}`,
        action: "foi registrada",
        details: `${maintenance.type || "Manutenção"} - ${
          maintenance.description || "Sem descrição"
        }`,
        createdAt: new Date(maintenance.created_at),
      });
    });

    // Atividades de abastecimentos (últimos 2)
    fuels.slice(0, 2).forEach((fuel) => {
      allActivities.push({
        id: `fuel_${fuel.id}`,
        entityType: "Abastecimento",
        entityId: fuel.id,
        entityName: fuel.vehicle_plate || `ID: ${fuel.id}`,
        action: "foi registrado",
        details: `${fuel.liters}L - R$ ${fuel.cost?.toFixed(2) || "0,00"}`,
        createdAt: new Date(fuel.created_at),
      });
    });

    // Ordenar todas as atividades por data (mais recente primeiro)
    allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pegar apenas as 6 mais recentes
    return allActivities.slice(0, 6);
  }, [employees, equipment, vehicles, movements, maintenances, fuels]);

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "Colaborador":
        return <User className="h-4 w-4" />;
      case "Equipamento":
        return <Wrench className="h-4 w-4" />;
      case "Veículo":
        return <Truck className="h-4 w-4" />;
      case "Movimentação":
        return <Package className="h-4 w-4" />;
      case "Manutenção":
        return <Wrench className="h-4 w-4" />;
      case "Abastecimento":
        return <Fuel className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case "Colaborador":
        return "bg-blue-500";
      case "Equipamento":
        return "bg-green-500";
      case "Veículo":
        return "bg-purple-500";
      case "Movimentação":
        return "bg-orange-500";
      case "Manutenção":
        return "bg-red-500";
      case "Abastecimento":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "agora mesmo";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} dias`;
    }
  };

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
          {Array.from({ length: 6 }).map((_, i) => (
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
    );
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
    );
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
                <AvatarFallback
                  className={`${getActivityColor(
                    activity.entityType
                  )} text-white`}
                >
                  {getActivityIcon(activity.entityType)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  <span className="font-semibold">{activity.entityName}</span>{" "}
                  {activity.action}
                </p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground">
                    {activity.details}
                  </p>
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
              onClick={() => router.push("/dashboard/atividades")}
              className="w-full cursor-pointer"
            >
              Ver Todas as Atividades
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
