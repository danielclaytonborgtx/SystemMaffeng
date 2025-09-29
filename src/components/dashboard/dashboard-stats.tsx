"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Truck, AlertTriangle, Loader2 } from "lucide-react";
import { memo, useMemo } from "react";
import {
  useEmployeesQuery,
  useEquipmentQuery,
  useVehiclesQuery,
  useVehicleScheduledMaintenancesQuery,
} from "@/hooks";

export const DashboardStats = memo(function DashboardStats() {
  const { data: employees = [], isLoading: employeesLoading } =
    useEmployeesQuery();
  const { data: equipment = [], isLoading: equipmentLoading } =
    useEquipmentQuery();
  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useVehiclesQuery();
  const {
    data: scheduledMaintenances = [],
    isLoading: scheduledMaintenancesLoading,
  } = useVehicleScheduledMaintenancesQuery();

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(
      (emp) => emp.status === "active"
    ).length;
    const availableEquipment = equipment.filter(
      (eq) => eq.status === "available"
    ).length;
    const activeVehicles = vehicles.filter(
      (veh) => veh.status === "active"
    ).length;

    // Calcular alertas de manutenção (veículos próximos da manutenção)
    let maintenanceAlerts = 0;

    // Contar alertas de manutenção manual dos veículos
    vehicles.forEach((vehicle) => {
      // Verificar por quilometragem
      if (vehicle.current_km && vehicle.maintenance_km) {
        const kmUntilMaintenance = vehicle.maintenance_km - vehicle.current_km;
        if (kmUntilMaintenance <= 1000) {
          maintenanceAlerts++;
          return;
        }
      }

      // Verificar por data
      if (vehicle.next_maintenance) {
        const nextMaintenanceDate = new Date(vehicle.next_maintenance);
        const today = new Date();
        const daysUntilMaintenance = Math.ceil(
          (nextMaintenanceDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysUntilMaintenance <= 7) {
          maintenanceAlerts++;
          return;
        }
      }
    });

    // Contar alertas de manutenções programadas
    vehicles.forEach((vehicle) => {
      const vehicleScheduledMaintenances = scheduledMaintenances.filter(
        (sm) => String(sm.vehicle_id) === String(vehicle.id) && sm.is_active
      );

      vehicleScheduledMaintenances.forEach((scheduledMaintenance) => {
        const currentKm = vehicle.current_km || 0;
        const kmUntilMaintenance =
          scheduledMaintenance.next_maintenance_km - currentKm;

        // Alerta por quilometragem das manutenções programadas
        if (kmUntilMaintenance <= 1000) {
          maintenanceAlerts++;
        }
      });
    });

    return [
      {
        title: "Equipamentos Disponíveis",
        value: availableEquipment.toString(),
        icon: Package,
        iconColor: "text-blue-500",
        description: `${equipment.length} total de equipamentos`,
        loading: equipmentLoading,
      },
      {
        title: "Colaboradores Ativos",
        value: activeEmployees.toString(),
        icon: Users,
        iconColor: "text-green-500",
        description: `${employees.length} total de colaboradores`,
        loading: employeesLoading,
      },
      {
        title: "Veículos Ativos",
        value: activeVehicles.toString(),
        icon: Truck,
        iconColor: "text-purple-500",
        description: `${vehicles.length} total de veículos`,
        loading: vehiclesLoading,
      },
      {
        title: "Alertas de Manutenção",
        value: maintenanceAlerts.toString(),
        icon: AlertTriangle,
        iconColor: "text-red-500",
        description: "Manutenções vencidas",
        loading: vehiclesLoading || scheduledMaintenancesLoading,
      },
    ];
  }, [
    employees,
    equipment,
    vehicles,
    scheduledMaintenances,
    employeesLoading,
    equipmentLoading,
    vehiclesLoading,
    scheduledMaintenancesLoading,
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border shadow-lg bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 rounded-full bg-muted/50">
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.loading ? (
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.loading ? (
                <div className="animate-pulse bg-muted h-3 w-24 rounded"></div>
              ) : (
                stat.description
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
