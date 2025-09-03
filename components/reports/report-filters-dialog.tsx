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
      case "manutencoes":
        return {
          title: "Filtros - Relatório de Manutenções",
          filters: [
            { id: "tipo", label: "Tipo de Manutenção", options: ["Todas", "Preventiva", "Corretiva", "Preditiva"] },
            { id: "veiculo", label: "Veículo", options: ["Todos", "Caminhões", "Carros", "Motos", "Máquinas"] },
            { id: "status", label: "Status", options: ["Todas", "Concluída", "Pendente", "Em Andamento"] },
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{filterOptions.title}</DialogTitle>
          <DialogDescription>Configure os filtros para personalizar seu relatório</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <DatePickerWithRange />
          </div>

          {filterOptions.filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <Label>{filter.label}</Label>
              <Select defaultValue={filter.options[0]}>
                <SelectTrigger>
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

          <div className="space-y-3">
            <Label>Opções de Exportação</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-graficos" defaultChecked />
                <Label htmlFor="incluir-graficos">Incluir gráficos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-detalhes" defaultChecked />
                <Label htmlFor="incluir-detalhes">Incluir detalhes completos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-anexos" />
                <Label htmlFor="incluir-anexos">Incluir anexos/fotos</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setOpen(false)}>Gerar Relatório</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
