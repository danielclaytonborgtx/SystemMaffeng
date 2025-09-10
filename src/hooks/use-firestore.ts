"use client"

import { useState, useEffect } from 'react'
import { 
  employeeService, 
  equipmentService, 
  vehicleService,
  Employee,
  Equipment,
  Vehicle
} from '@/lib/firestore'

interface UseFirestoreState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Hook para Colaboradores
export function useEmployees(): UseFirestoreState<Employee> {
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
export function useEquipment(): UseFirestoreState<Equipment> {
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
export function useVehicles(): UseFirestoreState<Vehicle> {
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
export function useFirestoreOperation() {
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

  const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
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