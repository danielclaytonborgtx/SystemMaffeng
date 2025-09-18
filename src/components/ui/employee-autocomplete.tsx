"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  name: string
  code: string
  status?: string
}

interface EmployeeAutocompleteProps {
  label?: string
  placeholder?: string
  value?: string
  onChange: (employee: Employee | null) => void
  employees: Employee[]
  error?: string
  required?: boolean
  className?: string
}

function EmployeeAutocomplete({
  label = "Colaborador",
  placeholder = "Digite o nome ou código do colaborador...",
  value = "",
  onChange,
  employees,
  error,
  required = false,
  className
}: EmployeeAutocompleteProps) {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar colaboradores baseado no input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredEmployees([])
      return
    }

    const filtered = employees.filter(employee => {
      const searchTerm = inputValue.toLowerCase()
      return (
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.code.toLowerCase().includes(searchTerm)
      )
    })
    setFilteredEmployees(filtered)
  }, [inputValue, employees])

  // Atualizar input quando value prop muda
  useEffect(() => {
    if (value && value !== inputValue) {
      const employee = employees.find(emp => emp.id === value || emp.name === value)
      if (employee) {
        setSelectedEmployee(employee)
        setInputValue(employee.name)
      }
    }
  }, [value, employees, inputValue])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)

    // Se o input for limpo, limpar seleção
    if (!newValue.trim()) {
      setSelectedEmployee(null)
      onChange(null)
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    setInputValue(employee.name)
    setIsOpen(false)
    onChange(employee)
  }

  const handleClear = () => {
    setInputValue("")
    setSelectedEmployee(null)
    setIsOpen(false)
    onChange(null)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="employee-autocomplete" className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              id="employee-autocomplete"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={cn(
                "pr-10",
                error && "border-red-500 focus-visible:ring-red-500"
              )}
              autoComplete="off"
            />
            
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={handleClear}
              >
                ×
              </Button>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="shrink-0"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Dropdown de opções */}
        {isOpen && filteredEmployees.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50",
                  selectedEmployee?.id === employee.id && "bg-blue-50"
                )}
                onClick={() => handleEmployeeSelect(employee)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{employee.name}</span>
                  <span className="text-sm text-gray-500">Código: {employee.code}</span>
                </div>
                {selectedEmployee?.id === employee.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {isOpen && inputValue.trim() && filteredEmployees.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
            <p className="text-sm text-gray-500 text-center">
              Nenhum colaborador encontrado
            </p>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Informações do colaborador selecionado */}
      {selectedEmployee && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">
            Colaborador selecionado: <strong>{selectedEmployee.name}</strong> ({selectedEmployee.code})
          </span>
        </div>
      )}
    </div>
  )
}

export { EmployeeAutocomplete }
