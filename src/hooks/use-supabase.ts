"use client"

import { useState, useEffect } from 'react'
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
  VehicleScheduledMaintenanceUpdate
} from '@/lib/supabase-services'

interface UseSupabaseState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Hook para Colaboradores
export function useEmployees(): UseSupabaseState<Employee> {
  const [data, setData] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const employees = await employeeService.getAll()
      setData(employees)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar colaboradores')
      console.error('Erro ao buscar colaboradores:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Hook para Equipamentos
export function useEquipment(): UseSupabaseState<Equipment> {
  const [data, setData] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const equipment = await equipmentService.getAll()
      setData(equipment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipamentos')
      console.error('Erro ao buscar equipamentos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Hook para Veículos
export function useVehicles(): UseSupabaseState<Vehicle> {
  const [data, setData] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const vehicles = await vehicleService.getAll()
      setData(vehicles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar veículos')
      console.error('Erro ao buscar veículos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Hook genérico para operações CRUD
export function useSupabaseOperation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na operação')
      console.error('Erro na operação:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}

// Hook específico para operações de colaboradores
export function useEmployeeOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEmployee = async (employeeData: EmployeeInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await employeeService.create(employeeData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar colaborador')
      console.error('Erro ao criar colaborador:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateEmployee = async (id: string, employeeData: EmployeeUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await employeeService.update(id, employeeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar colaborador')
      console.error('Erro ao atualizar colaborador:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await employeeService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar colaborador')
      console.error('Erro ao deletar colaborador:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createEmployee, updateEmployee, deleteEmployee }
}

// Hook específico para operações de equipamentos
export function useEquipmentOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEquipment = async (equipmentData: EquipmentInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await equipmentService.create(equipmentData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar equipamento')
      console.error('Erro ao criar equipamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateEquipment = async (id: string, equipmentData: EquipmentUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await equipmentService.update(id, equipmentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar equipamento')
      console.error('Erro ao atualizar equipamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEquipment = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Tentando deletar equipamento com ID:', id)
      await equipmentService.delete(id)
      console.log('Equipamento deletado com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar equipamento')
      console.error('Erro ao deletar equipamento:', err)
      console.error('Detalhes do erro:', JSON.stringify(err, null, 2))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fixInconsistentData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await equipmentService.fixInconsistentData()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao corrigir dados inconsistentes')
      console.error('Erro ao corrigir dados inconsistentes:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createEquipment, updateEquipment, deleteEquipment, fixInconsistentData }
}

// Hook específico para operações de veículos
export function useVehicleOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVehicle = async (vehicleData: VehicleInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await vehicleService.create(vehicleData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar veículo')
      console.error('Erro ao criar veículo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateVehicle = async (id: string, vehicleData: VehicleUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleService.update(id, vehicleData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar veículo')
      console.error('Erro ao atualizar veículo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar veículo')
      console.error('Erro ao deletar veículo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createVehicle, updateVehicle, deleteVehicle }
}

// Hook para Movimentações de Equipamentos
export function useEquipmentMovements(equipmentId?: string, employeeId?: string): UseSupabaseState<EquipmentMovement> {
  const [data, setData] = useState<EquipmentMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      let movements: EquipmentMovement[]
      
      if (equipmentId) {
        movements = await equipmentMovementService.getByEquipmentId(equipmentId)
      } else if (employeeId) {
        movements = await equipmentMovementService.getByEmployeeId(employeeId)
      } else {
        movements = await equipmentMovementService.getAll()
      }
      
      setData(movements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações')
      console.error('Erro ao buscar movimentações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [equipmentId, employeeId])

  return { data, loading, error, refetch: fetchData }
}

// Hook específico para operações de movimentações
export function useEquipmentMovementOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMovement = async (movementData: EquipmentMovementInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await equipmentMovementService.create(movementData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar movimentação')
      console.error('Erro ao criar movimentação:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMovement = async (id: string, movementData: EquipmentMovementUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await equipmentMovementService.update(id, movementData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar movimentação')
      console.error('Erro ao atualizar movimentação:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMovement = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await equipmentMovementService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar movimentação')
      console.error('Erro ao deletar movimentação:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createMovement, updateMovement, deleteMovement }
}

// Hook para Manutenções de Veículos
export function useVehicleMaintenances(vehicleId?: string): UseSupabaseState<VehicleMaintenance> {
  const [data, setData] = useState<VehicleMaintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      let maintenances: VehicleMaintenance[]
      
      if (vehicleId) {
        maintenances = await vehicleMaintenanceService.getByVehicleId(vehicleId)
      } else {
        maintenances = await vehicleMaintenanceService.getAll()
      }
      
      setData(maintenances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar manutenções')
      console.error('Erro ao buscar manutenções:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [vehicleId])

  return { data, loading, error, refetch: fetchData }
}

// Hook específico para operações de manutenções
export function useVehicleMaintenanceOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMaintenance = async (maintenanceData: VehicleMaintenanceInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await vehicleMaintenanceService.create(maintenanceData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar manutenção')
      console.error('Erro ao criar manutenção:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMaintenance = async (id: string, maintenanceData: VehicleMaintenanceUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleMaintenanceService.update(id, maintenanceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar manutenção')
      console.error('Erro ao atualizar manutenção:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMaintenance = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleMaintenanceService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar manutenção')
      console.error('Erro ao deletar manutenção:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createMaintenance, updateMaintenance, deleteMaintenance }
}

// Hook para Abastecimentos de Combustível
export function useVehicleFuels(vehicleId?: string): UseSupabaseState<VehicleFuel> {
  const [data, setData] = useState<VehicleFuel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      let fuels: VehicleFuel[]
      
      if (vehicleId) {
        fuels = await vehicleFuelService.getByVehicleId(vehicleId)
      } else {
        fuels = await vehicleFuelService.getAll()
      }
      
      setData(fuels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar abastecimentos')
      console.error('Erro ao buscar abastecimentos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [vehicleId])

  return { data, loading, error, refetch: fetchData }
}

// Hook específico para operações de combustível
export function useVehicleFuelOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFuel = async (fuelData: VehicleFuelInsert) => {
    try {
      setLoading(true)
      setError(null)
      
      // Criar o registro de abastecimento
      const id = await vehicleFuelService.create(fuelData)
      
      // Atualizar a quilometragem atual do veículo
      if (fuelData.vehicle_id && fuelData.current_km) {
        await vehicleService.update(fuelData.vehicle_id, {
          current_km: fuelData.current_km
        })
      }
      
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar abastecimento')
      console.error('Erro ao criar abastecimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateFuel = async (id: string, fuelData: VehicleFuelUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleFuelService.update(id, fuelData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar abastecimento')
      console.error('Erro ao atualizar abastecimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteFuel = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleFuelService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar abastecimento')
      console.error('Erro ao deletar abastecimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createFuel, updateFuel, deleteFuel }
}

// Hook para Manutenções Programadas
export function useVehicleScheduledMaintenances(vehicleId?: string): UseSupabaseState<VehicleScheduledMaintenance> {
  const [data, setData] = useState<VehicleScheduledMaintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      let scheduledMaintenances: VehicleScheduledMaintenance[]
      
      if (vehicleId) {
        scheduledMaintenances = await vehicleScheduledMaintenanceService.getByVehicleId(vehicleId)
      } else {
        scheduledMaintenances = await vehicleScheduledMaintenanceService.getAll()
      }
      
      setData(scheduledMaintenances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar manutenções programadas')
      console.error('Erro ao buscar manutenções programadas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [vehicleId])

  return { data, loading, error, refetch: fetchData }
}

// Hook específico para operações de manutenções programadas
export function useVehicleScheduledMaintenanceOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createScheduledMaintenance = async (scheduledMaintenanceData: VehicleScheduledMaintenanceInsert) => {
    try {
      setLoading(true)
      setError(null)
      const id = await vehicleScheduledMaintenanceService.create(scheduledMaintenanceData)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar manutenção programada')
      console.error('Erro ao criar manutenção programada:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateScheduledMaintenance = async (id: string, scheduledMaintenanceData: VehicleScheduledMaintenanceUpdate) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleScheduledMaintenanceService.update(id, scheduledMaintenanceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar manutenção programada')
      console.error('Erro ao atualizar manutenção programada:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteScheduledMaintenance = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleScheduledMaintenanceService.delete(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar manutenção programada')
      console.error('Erro ao deletar manutenção programada:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const upsertScheduledMaintenances = async (vehicleId: string, scheduledMaintenances: VehicleScheduledMaintenanceInsert[]) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleScheduledMaintenanceService.upsertScheduledMaintenances(vehicleId, scheduledMaintenances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar manutenções programadas')
      console.error('Erro ao salvar manutenções programadas:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSpecificScheduledMaintenance = async (vehicleId: string, maintenanceType: string, updatedData: Partial<VehicleScheduledMaintenanceUpdate>) => {
    try {
      setLoading(true)
      setError(null)
      await vehicleScheduledMaintenanceService.updateSpecificScheduledMaintenance(vehicleId, maintenanceType, updatedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar manutenção específica')
      console.error('Erro ao atualizar manutenção específica:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { 
    loading, 
    error, 
    createScheduledMaintenance, 
    updateScheduledMaintenance, 
    deleteScheduledMaintenance,
    upsertScheduledMaintenances,
    updateSpecificScheduledMaintenance
  }
}
