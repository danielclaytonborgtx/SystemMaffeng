"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"

interface ReportFiltersDialogProps {
  children: React.ReactNode
  category: string
}

export function ReportFiltersDialog({ children, category }: ReportFiltersDialogProps) {
  const [open, setOpen] = useState(false)

  const getFilterOptions = () => {
    switch (category) {
      case "equipamentos":
        return {
          title: "Filtros - Relatório de Equipamentos",
          filters: [
            {
              id: "tipo",
              label: "Tipo de Equipamento",
              options: ["Todos", "Ferramentas Manuais", "Ferramentas Elétricas", "Máquinas", "EPI"],
            },
            { id: "status", label: "Status", options: ["Todos", "Disponível", "Em Uso", "Manutenção", "Indisponível"] },
            { id: "projeto", label: "Projeto", options: ["Todos", "Obra Centro", "Obra Norte", "Obra Sul"] },
          ],
        }
      case "veiculos":
        return {
          title: "Filtros - Relatório de Veículos",
          filters: [
            { id: "tipo", label: "Tipo de Veículo", options: ["Todos", "Carro", "Caminhão", "Moto", "Máquina"] },
            { id: "status", label: "Status", options: ["Todos", "Ativo", "Inativo", "Manutenção"] },
            { id: "combustivel", label: "Tipo de Combustível", options: ["Todos", "Gasolina", "Diesel", "Etanol", "GNV"] },
          ],
        }
      case "manutencoes":
        return {
          title: "Filtros - Relatório de Manutenções",
          filters: [
            { id: "tipo", label: "Tipo de Manutenção", options: ["Todas", "Preventiva", "Corretiva", "Preditiva"] },
            { id: "veiculo", label: "Veículo", options: ["Todos", "Caminhões", "Carros", "Motos", "Máquinas"] },
            { id: "status", label: "Status", options: ["Todas", "Concluída", "Pendente", "Em Andamento"] },
          ],
        }
      case "abastecimentos":
        return {
          title: "Filtros - Relatório de Abastecimentos",
          filters: [
            { id: "combustivel", label: "Tipo de Combustível", options: ["Todos", "Gasolina", "Diesel", "Etanol", "GNV"] },
            { id: "veiculo", label: "Veículo", options: ["Todos", "Caminhões", "Carros", "Motos", "Máquinas"] },
            { id: "posto", label: "Posto", options: ["Todos", "Posto A", "Posto B", "Posto C"] },
          ],
        }
      case "financeiro":
        return {
          title: "Filtros - Relatório Financeiro",
          filters: [
            {
              id: "categoria",
              label: "Categoria",
              options: ["Todas", "Equipamentos", "Manutenção", "Combustível", "Pessoal"],
            },
            {
              id: "centro",
              label: "Centro de Custo",
              options: ["Todos", "Administrativo", "Operacional", "Manutenção"],
            },
            { id: "moeda", label: "Moeda", options: ["Real (R$)", "Dólar (US$)"] },
          ],
        }
      default:
        return {
          title: "Filtros - Relatório de Colaboradores",
          filters: [
            {
              id: "departamento",
              label: "Departamento",
              options: ["Todos", "Operacional", "Administrativo", "Manutenção"],
            },
            { id: "cargo", label: "Cargo", options: ["Todos", "Operador", "Técnico", "Supervisor", "Gerente"] },
            { id: "status", label: "Status", options: ["Todos", "Ativo", "Inativo", "Férias"] },
          ],
        }
    }
  }

  const filterOptions = getFilterOptions()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {filterOptions.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Configure os filtros para personalizar seu relatório
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seção de Período */}
          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Período do Relatório
              </Label>
              <DatePickerWithRange />
            </div>
          </div>

          {/* Seção de Filtros */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Label className="text-sm font-medium text-gray-700">Filtros Específicos</Label>
            </div>
            
            <div className="grid gap-4">
              {filterOptions.filters.map((filter, index) => (
                <div key={filter.id} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {filter.label}
                  </Label>
                  <Select defaultValue={filter.options[0]}>
                    <SelectTrigger className="border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Opções de Exportação */}
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <Label className="text-sm font-medium text-gray-700">Opções de Exportação</Label>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/50 transition-colors">
                  <Checkbox 
                    id="incluir-graficos" 
                    defaultChecked 
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="incluir-graficos" className="text-sm text-gray-700 cursor-pointer">
                    Incluir gráficos e visualizações
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/50 transition-colors">
                  <Checkbox 
                    id="incluir-detalhes" 
                    defaultChecked 
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="incluir-detalhes" className="text-sm text-gray-700 cursor-pointer">
                    Incluir detalhes completos
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/50 transition-colors">
                  <Checkbox 
                    id="incluir-anexos" 
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="incluir-anexos" className="text-sm text-gray-700 cursor-pointer">
                    Incluir anexos e fotos
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            className="cursor-pointer border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => setOpen(false)} 
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Gerar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
