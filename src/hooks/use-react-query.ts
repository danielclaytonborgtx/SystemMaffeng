"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/query-client";
import {
  employeeService,
  equipmentService,
  vehicleService,
  equipmentMovementService,
  vehicleMaintenanceService,
  vehicleFuelService,
  vehicleScheduledMaintenanceService,
  Employee,
  Equipment,
  Vehicle,
  EquipmentMovement,
  VehicleMaintenance,
  VehicleFuel,
  VehicleScheduledMaintenance,
  EmployeeInsert,
  EquipmentInsert,
  VehicleInsert,
  EquipmentMovementInsert,
  VehicleMaintenanceInsert,
  VehicleFuelInsert,
  VehicleScheduledMaintenanceInsert,
  EmployeeUpdate,
  EquipmentUpdate,
  VehicleUpdate,
  EquipmentMovementUpdate,
  VehicleMaintenanceUpdate,
  VehicleFuelUpdate,
  VehicleScheduledMaintenanceUpdate,
} from "@/lib/supabase-services";
import { queryKeys } from "@/lib/query-client";

// Hook para Colaboradores com React Query e cache inteligente
export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => employeeService.getAll(),
    ...CACHE_CONFIG.employees,
    // Refetch em background quando dados ficam stale
    refetchIntervalInBackground: false,
    // Refetch quando voltar online
    refetchOnReconnect: true,
    // Manter dados frescos quando janela ganha foco
    refetchOnWindowFocus: true,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
    ...CACHE_CONFIG.employees,
    // Não refetch automaticamente para dados individuais
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

// Hook para Equipamentos com React Query e cache inteligente
export function useEquipment() {
  return useQuery({
    queryKey: queryKeys.equipment,
    queryFn: () => equipmentService.getAll(),
    ...CACHE_CONFIG.equipment,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: queryKeys.equipmentItem(id),
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
    ...CACHE_CONFIG.equipment,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

// Hook para Veículos com React Query e cache inteligente
export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: () => vehicleService.getAll(),
    ...CACHE_CONFIG.vehicles,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: queryKeys.vehicle(id),
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para Movimentações de Equipamentos com React Query e cache dinâmico
export function useEquipmentMovements(
  equipmentId?: string,
  employeeId?: string
) {
  const queryKey = equipmentId
    ? queryKeys.equipmentMovementsByEquipment(equipmentId)
    : employeeId
    ? queryKeys.equipmentMovementsByEmployee(employeeId)
    : queryKeys.equipmentMovements;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (equipmentId) {
        return equipmentMovementService.getByEquipmentId(equipmentId);
      } else if (employeeId) {
        return equipmentMovementService.getByEmployeeId(employeeId);
      } else {
        return equipmentMovementService.getAll();
      }
    },
    ...CACHE_CONFIG.movements,
    // Refetch mais frequente para dados dinâmicos
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

// Hook para Manutenções de Veículos com React Query
export function useVehicleMaintenances(vehicleId?: string) {
  const queryKey = vehicleId
    ? queryKeys.vehicleMaintenancesByVehicle(vehicleId)
    : queryKeys.vehicleMaintenances;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (vehicleId) {
        return vehicleMaintenanceService.getByVehicleId(vehicleId);
      } else {
        return vehicleMaintenanceService.getAll();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para Abastecimentos com React Query
export function useVehicleFuels(vehicleId?: string) {
  const queryKey = vehicleId
    ? queryKeys.vehicleFuelsByVehicle(vehicleId)
    : queryKeys.vehicleFuels;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (vehicleId) {
        return vehicleFuelService.getByVehicleId(vehicleId);
      } else {
        return vehicleFuelService.getAll();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para Manutenções Programadas com React Query
export function useVehicleScheduledMaintenances(vehicleId?: string) {
  const queryKey = vehicleId
    ? queryKeys.vehicleScheduledMaintenancesByVehicle(vehicleId)
    : queryKeys.vehicleScheduledMaintenances;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (vehicleId) {
        return vehicleScheduledMaintenanceService.getByVehicleId(vehicleId);
      } else {
        return vehicleScheduledMaintenanceService.getAll();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (manutenções programadas mudam menos)
  });
}

// Mutations para Colaboradores
export function useEmployeeMutations() {
  const queryClient = useQueryClient();

  const createEmployee = useMutation({
    mutationFn: (data: EmployeeInsert) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdate }) =>
      employeeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      queryClient.invalidateQueries({ queryKey: queryKeys.employee(id) });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });

  return {
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

// Mutations para Equipamentos
export function useEquipmentMutations() {
  const queryClient = useQueryClient();

  const createEquipment = useMutation({
    mutationFn: (data: EquipmentInsert) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
    },
  });

  const updateEquipment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentUpdate }) =>
      equipmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
      queryClient.invalidateQueries({ queryKey: queryKeys.equipmentItem(id) });
    },
  });

  const deleteEquipment = useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
    },
  });

  return {
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}

// Mutations para Veículos
export function useVehicleMutations() {
  const queryClient = useQueryClient();

  const createVehicle = useMutation({
    mutationFn: (data: VehicleInsert) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleUpdate }) =>
      vehicleService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicle(id) });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) => vehicleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });

  return {
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}

// Mutations para Movimentações de Equipamentos
export function useEquipmentMovementMutations() {
  const queryClient = useQueryClient();

  const createMovement = useMutation({
    mutationFn: (data: EquipmentMovementInsert) =>
      equipmentMovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipmentMovements });
    },
  });

  const updateMovement = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentMovementUpdate }) =>
      equipmentMovementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipmentMovements });
    },
  });

  const deleteMovement = useMutation({
    mutationFn: (id: string) => equipmentMovementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipmentMovements });
    },
  });

  return {
    createMovement,
    updateMovement,
    deleteMovement,
  };
}

// Mutations para Manutenções de Veículos
export function useVehicleMaintenanceMutations() {
  const queryClient = useQueryClient();

  const createMaintenance = useMutation({
    mutationFn: (data: VehicleMaintenanceInsert) =>
      vehicleMaintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleMaintenances,
      });
    },
  });

  const updateMaintenance = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: VehicleMaintenanceUpdate;
    }) => vehicleMaintenanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleMaintenances,
      });
    },
  });

  const deleteMaintenance = useMutation({
    mutationFn: (id: string) => vehicleMaintenanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleMaintenances,
      });
    },
  });

  return {
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}

// Mutations para Abastecimentos
export function useVehicleFuelMutations() {
  const queryClient = useQueryClient();

  const createFuel = useMutation({
    mutationFn: (data: VehicleFuelInsert) => vehicleFuelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicleFuels });
    },
  });

  const updateFuel = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleFuelUpdate }) =>
      vehicleFuelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicleFuels });
    },
  });

  const deleteFuel = useMutation({
    mutationFn: (id: string) => vehicleFuelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicleFuels });
    },
  });

  return {
    createFuel,
    updateFuel,
    deleteFuel,
  };
}

// Mutations para Manutenções Programadas
export function useVehicleScheduledMaintenanceMutations() {
  const queryClient = useQueryClient();

  const createScheduledMaintenance = useMutation({
    mutationFn: (data: VehicleScheduledMaintenanceInsert) =>
      vehicleScheduledMaintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleScheduledMaintenances,
      });
    },
  });

  const updateScheduledMaintenance = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: VehicleScheduledMaintenanceUpdate;
    }) => vehicleScheduledMaintenanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleScheduledMaintenances,
      });
    },
  });

  const deleteScheduledMaintenance = useMutation({
    mutationFn: (id: string) => vehicleScheduledMaintenanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleScheduledMaintenances,
      });
    },
  });

  const upsertScheduledMaintenances = useMutation({
    mutationFn: ({
      vehicleId,
      data,
    }: {
      vehicleId: string;
      data: VehicleScheduledMaintenanceInsert[];
    }) =>
      vehicleScheduledMaintenanceService.upsertScheduledMaintenances(
        vehicleId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleScheduledMaintenances,
      });
    },
  });

  return {
    createScheduledMaintenance,
    updateScheduledMaintenance,
    deleteScheduledMaintenance,
    upsertScheduledMaintenances,
  };
}
