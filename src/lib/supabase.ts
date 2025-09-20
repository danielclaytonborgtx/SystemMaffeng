import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Please check your environment variables:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          name: string
          code: string
          email: string | null
          position: string
          department: string
          status: 'active' | 'vacation' | 'away' | 'inactive'
          phone: string | null
          hire_date: string | null
          address: string | null
          cpf: string | null
          rg: string | null
          contracts: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          email?: string | null
          position: string
          department: string
          status: 'active' | 'vacation' | 'away' | 'inactive'
          phone?: string | null
          hire_date?: string | null
          address?: string | null
          cpf?: string | null
          rg?: string | null
          contracts?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          email?: string | null
          position?: string
          department?: string
          status?: 'active' | 'vacation' | 'away' | 'inactive'
          phone?: string | null
          hire_date?: string | null
          address?: string | null
          cpf?: string | null
          rg?: string | null
          contracts?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          code: string
          category: string
          status: 'available' | 'in_use' | 'maintenance'
          location: string
          assigned_to: string | null
          value: number | null
          description: string | null
          purchase_date: string | null
          supplier: string | null
          invoice_number: string | null
          last_maintenance: string | null
          next_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          category: string
          status: 'available' | 'in_use' | 'maintenance'
          location: string
          assigned_to?: string | null
          value?: number | null
          description?: string | null
          purchase_date?: string | null
          supplier?: string | null
          invoice_number?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          category?: string
          status?: 'available' | 'in_use' | 'maintenance'
          location?: string
          assigned_to?: string | null
          value?: number | null
          description?: string | null
          purchase_date?: string | null
          supplier?: string | null
          invoice_number?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          plate: string
          model: string
          brand: string
          year: number
          current_km: number | null
          maintenance_km: number | null
          status: 'active' | 'maintenance' | 'retired'
          fuel_type: string | null
          chassis_number: string | null
          renavam: string | null
          color: string | null
          engine_capacity: string | null
          assigned_to: string | null
          purchase_date: string | null
          purchase_value: number | null
          insurance_expiry: string | null
          license_expiry: string | null
          observations: string | null
          last_maintenance: string | null
          next_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plate: string
          model: string
          brand: string
          year: number
          current_km?: number | null
          maintenance_km?: number | null
          status: 'active' | 'maintenance' | 'retired'
          fuel_type?: string | null
          chassis_number?: string | null
          renavam?: string | null
          color?: string | null
          engine_capacity?: string | null
          assigned_to?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          insurance_expiry?: string | null
          license_expiry?: string | null
          observations?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plate?: string
          model?: string
          brand?: string
          year?: number
          current_km?: number | null
          maintenance_km?: number | null
          status?: 'active' | 'maintenance' | 'retired'
          fuel_type?: string | null
          chassis_number?: string | null
          renavam?: string | null
          color?: string | null
          engine_capacity?: string | null
          assigned_to?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          insurance_expiry?: string | null
          license_expiry?: string | null
          observations?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment_movements: {
        Row: {
          id: string
          equipment_id: string
          equipment_name: string
          equipment_code: string
          employee_id: string
          employee_name: string
          employee_code: string
          type: 'out' | 'return'
          project: string
          expected_return_date: string | null
          actual_return_date: string | null
          observations: string | null
          checklist: {
            equipment_good_condition: boolean
            accessories_included: boolean
            manual_present: boolean
            equipment_clean: boolean
            no_visible_damage: boolean
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          equipment_name: string
          equipment_code: string
          employee_id: string
          employee_name: string
          employee_code: string
          type: 'out' | 'return'
          project: string
          expected_return_date?: string | null
          actual_return_date?: string | null
          observations?: string | null
          checklist?: {
            equipment_good_condition: boolean
            accessories_included: boolean
            manual_present: boolean
            equipment_clean: boolean
            no_visible_damage: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          equipment_name?: string
          equipment_code?: string
          employee_id?: string
          employee_name?: string
          employee_code?: string
          type?: 'out' | 'return'
          project?: string
          expected_return_date?: string | null
          actual_return_date?: string | null
          observations?: string | null
          checklist?: {
            equipment_good_condition: boolean
            accessories_included: boolean
            manual_present: boolean
            equipment_clean: boolean
            no_visible_damage: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_maintenances: {
        Row: {
          id: string
          vehicle_id: string
          vehicle_plate: string
          vehicle_model: string
          type: 'preventiva' | 'corretiva' | 'preditiva'
          description: string
          current_km: number
          cost: number
          items: string[]
          next_maintenance_km: number | null
          observations: string | null
          performed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          vehicle_plate: string
          vehicle_model: string
          type: 'preventiva' | 'corretiva' | 'preditiva'
          description: string
          current_km: number
          cost: number
          items: string[]
          next_maintenance_km?: number | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          vehicle_plate?: string
          vehicle_model?: string
          type?: 'preventiva' | 'corretiva' | 'preditiva'
          description?: string
          current_km?: number
          cost?: number
          items?: string[]
          next_maintenance_km?: number | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_fuels: {
        Row: {
          id: string
          vehicle_id: string
          vehicle_plate: string
          vehicle_model: string
          current_km: number
          liters: number
          cost: number
          price_per_liter: number
          consumption: number | null
          station: string
          observations: string | null
          performed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          vehicle_plate: string
          vehicle_model: string
          current_km: number
          liters: number
          cost: number
          price_per_liter: number
          consumption?: number | null
          station: string
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          vehicle_plate?: string
          vehicle_model?: string
          current_km?: number
          liters?: number
          cost?: number
          price_per_liter?: number
          consumption?: number | null
          station?: string
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_scheduled_maintenances: {
        Row: {
          id: string
          vehicle_id: string
          maintenance_type: string
          maintenance_name: string
          interval_km: number
          next_maintenance_km: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          maintenance_type: string
          maintenance_name: string
          interval_km: number
          next_maintenance_km: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          maintenance_type?: string
          maintenance_name?: string
          interval_km?: number
          next_maintenance_km?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Tipos auxiliares para compatibilidade com o código existente
export type Employee = Database['public']['Tables']['employees']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type EquipmentMovement = Database['public']['Tables']['equipment_movements']['Row']
export type VehicleMaintenance = Database['public']['Tables']['vehicle_maintenances']['Row']
export type VehicleFuel = Database['public']['Tables']['vehicle_fuels']['Row']
export type VehicleScheduledMaintenance = Database['public']['Tables']['vehicle_scheduled_maintenances']['Row']

export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
export type EquipmentMovementInsert = Database['public']['Tables']['equipment_movements']['Insert']
export type VehicleMaintenanceInsert = Database['public']['Tables']['vehicle_maintenances']['Insert']
export type VehicleFuelInsert = Database['public']['Tables']['vehicle_fuels']['Insert']
export type VehicleScheduledMaintenanceInsert = Database['public']['Tables']['vehicle_scheduled_maintenances']['Insert']

export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']
export type EquipmentMovementUpdate = Database['public']['Tables']['equipment_movements']['Update']
export type VehicleMaintenanceUpdate = Database['public']['Tables']['vehicle_maintenances']['Update']
export type VehicleFuelUpdate = Database['public']['Tables']['vehicle_fuels']['Update']
export type VehicleScheduledMaintenanceUpdate = Database['public']['Tables']['vehicle_scheduled_maintenances']['Update']
