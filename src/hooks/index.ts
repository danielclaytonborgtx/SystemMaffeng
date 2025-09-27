// Supabase hooks (new)
export {
  useEmployees,
  useEquipment,
  useVehicles,
  useSupabaseOperation,
  useEmployeeOperations,
  useEquipmentOperations,
  useVehicleOperations,
  useEquipmentMovements,
  useEquipmentMovementOperations,
  useVehicleMaintenances,
  useVehicleMaintenanceOperations,
  useVehicleFuels,
  useVehicleFuelOperations,
  useVehicleScheduledMaintenances,
  useVehicleScheduledMaintenanceOperations,
} from "./use-supabase";

// Firebase hooks (legacy - to be removed)
// export { useEmployees, useEquipment, useVehicles, useFirestoreOperation, useEmployeeOperations, useEquipmentOperations, useVehicleOperations, useEquipmentMovements, useEquipmentMovementOperations, useVehicleMaintenances, useVehicleMaintenanceOperations, useVehicleFuels, useVehicleFuelOperations } from './use-firestore'

export { useBarcodeReader } from "./use-barcode-reader";
export { useVehicleMaintenanceInfo } from "./use-vehicle-maintenance-info";
export { useVirtualPagination } from "./use-virtual-pagination";
export { useServerPagination } from "./use-server-pagination";
export { useEmployeesPaginated } from "./use-employees-paginated";
export { useAuthPersistence } from "./use-auth-persistence";

// React Query hooks (otimizados com cache)
export {
  useEmployees as useEmployeesQuery,
  useEmployee,
  useEquipment as useEquipmentQuery,
  useEquipmentItem,
  useVehicles as useVehiclesQuery,
  useVehicle,
  useEquipmentMovements as useEquipmentMovementsQuery,
  useVehicleMaintenances as useVehicleMaintenancesQuery,
  useVehicleFuels as useVehicleFuelsQuery,
  useVehicleScheduledMaintenances as useVehicleScheduledMaintenancesQuery,
  useEmployeeMutations,
  useEquipmentMutations,
  useVehicleMutations,
  useEquipmentMovementMutations,
  useVehicleMaintenanceMutations,
  useVehicleFuelMutations,
  useVehicleScheduledMaintenanceMutations,
} from "./use-react-query";
