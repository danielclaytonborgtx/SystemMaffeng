import { supabase } from './supabase'
import type { 
  Employee, 
  Equipment, 
  Vehicle, 
  EquipmentMovement, 
  VehicleMaintenance, 
  VehicleFuel,
  EmployeeInsert,
  EquipmentInsert,
  VehicleInsert,
  EquipmentMovementInsert,
  VehicleMaintenanceInsert,
  VehicleFuelInsert,
  EmployeeUpdate,
  EquipmentUpdate,
  VehicleUpdate,
  EquipmentMovementUpdate,
  VehicleMaintenanceUpdate,
  VehicleFuelUpdate
} from './supabase'

// Funções para Colaboradores
export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async create(employee: EmployeeInsert): Promise<string> {
    // Verificar se o código já existe
    const existingEmployee = await this.getByCode(employee.code)
    if (existingEmployee) {
      throw new Error(`Já existe um colaborador com o código "${employee.code}"`)
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async getByCode(code: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('code', code)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async update(id: string, employee: EmployeeUpdate): Promise<void> {
    // Se está atualizando o código, verificar se já existe
    if (employee.code) {
      const existingEmployee = await this.getByCode(employee.code)
      if (existingEmployee && existingEmployee.id !== id) {
        throw new Error(`Já existe um colaborador com o código "${employee.code}"`)
      }
    }

    const { error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para Equipamentos
export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async create(equipment: EquipmentInsert): Promise<string> {
    // Verificar se o código já existe
    const existingEquipment = await this.getByCode(equipment.code)
    if (existingEquipment) {
      throw new Error(`Já existe um equipamento com o código "${equipment.code}"`)
    }

    const { data, error } = await supabase
      .from('equipment')
      .insert(equipment)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async getByCode(code: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('code', code)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async update(id: string, equipment: EquipmentUpdate): Promise<void> {
    // Se está atualizando o código, verificar se já existe
    if (equipment.code) {
      const existingEquipment = await this.getByCode(equipment.code)
      if (existingEquipment && existingEquipment.id !== id) {
        throw new Error(`Já existe um equipamento com o código "${equipment.code}"`)
      }
    }

    const { error } = await supabase
      .from('equipment')
      .update(equipment)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    // Primeiro, deletar todas as movimentações associadas ao equipamento
    const { error: movementsError } = await supabase
      .from('equipment_movements')
      .delete()
      .eq('equipment_id', id)
    
    if (movementsError) {
      console.error('Erro ao deletar movimentações do equipamento:', movementsError)
      throw movementsError
    }
    
    // Depois, deletar o equipamento
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async fixInconsistentData(): Promise<{ fixed: number; total: number }> {
    // Buscar todos os equipamentos disponíveis que ainda têm responsável
    const { data: inconsistentEquipment, error: fetchError } = await supabase
      .from('equipment')
      .select('id')
      .eq('status', 'available')
      .not('assigned_to', 'is', null)
    
    if (fetchError) throw fetchError
    
    if (!inconsistentEquipment || inconsistentEquipment.length === 0) {
      return { fixed: 0, total: 0 }
    }

    // Atualizar cada equipamento inconsistente
    const { error: updateError } = await supabase
      .from('equipment')
      .update({ assigned_to: null })
      .eq('status', 'available')
      .not('assigned_to', 'is', null)
    
    if (updateError) throw updateError
    
    return {
      fixed: inconsistentEquipment.length,
      total: inconsistentEquipment.length
    }
  }
}

// Funções para Veículos
export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        employee:assigned_to(name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Mapear os dados para incluir o nome do funcionário
    const vehiclesWithEmployeeNames = (data || []).map(vehicle => ({
      ...vehicle,
      assigned_to: vehicle.employee?.name || vehicle.assigned_to
    }))
    
    return vehiclesWithEmployeeNames
  },

  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async create(vehicle: VehicleInsert): Promise<string> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async update(id: string, vehicle: VehicleUpdate): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para Movimentações de Equipamentos
export const equipmentMovementService = {
  async getAll(): Promise<EquipmentMovement[]> {
    const { data, error } = await supabase
      .from('equipment_movements')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByEquipmentId(equipmentId: string): Promise<EquipmentMovement[]> {
    const { data, error } = await supabase
      .from('equipment_movements')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByEmployeeId(employeeId: string): Promise<EquipmentMovement[]> {
    const { data, error } = await supabase
      .from('equipment_movements')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(movement: EquipmentMovementInsert): Promise<string> {
    const { data, error } = await supabase
      .from('equipment_movements')
      .insert(movement)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async update(id: string, movement: EquipmentMovementUpdate): Promise<void> {
    const { error } = await supabase
      .from('equipment_movements')
      .update(movement)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_movements')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para Manutenções de Veículos
export const vehicleMaintenanceService = {
  async getAll(): Promise<VehicleMaintenance[]> {
    const { data, error } = await supabase
      .from('vehicle_maintenances')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByVehicleId(vehicleId: string): Promise<VehicleMaintenance[]> {
    const { data, error } = await supabase
      .from('vehicle_maintenances')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<VehicleMaintenance | null> {
    const { data, error } = await supabase
      .from('vehicle_maintenances')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async create(maintenance: VehicleMaintenanceInsert): Promise<string> {
    const { data, error } = await supabase
      .from('vehicle_maintenances')
      .insert(maintenance)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async update(id: string, maintenance: VehicleMaintenanceUpdate): Promise<void> {
    const { error } = await supabase
      .from('vehicle_maintenances')
      .update(maintenance)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_maintenances')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para Abastecimentos de Combustível
export const vehicleFuelService = {
  async getAll(): Promise<VehicleFuel[]> {
    const { data, error } = await supabase
      .from('vehicle_fuels')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByVehicleId(vehicleId: string): Promise<VehicleFuel[]> {
    const { data, error } = await supabase
      .from('vehicle_fuels')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<VehicleFuel | null> {
    const { data, error } = await supabase
      .from('vehicle_fuels')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async create(fuel: VehicleFuelInsert): Promise<string> {
    const { data, error } = await supabase
      .from('vehicle_fuels')
      .insert(fuel)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  },

  async update(id: string, fuel: VehicleFuelUpdate): Promise<void> {
    const { error } = await supabase
      .from('vehicle_fuels')
      .update(fuel)
      .eq('id', id)
    
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_fuels')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
