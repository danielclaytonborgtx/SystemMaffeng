"use client"

import React, { useState } from "react"
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
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

interface ReportFiltersDialogProps {
  children: React.ReactNode
  category: string
  currentPeriod?: any
  onSetPeriod?: (period: any) => void
}

export function ReportFiltersDialog({ children, category, currentPeriod, onSetPeriod }: ReportFiltersDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod)

  // Atualizar período quando currentPeriod mudar
  React.useEffect(() => {
    setSelectedPeriod(currentPeriod)
  }, [currentPeriod])


  const handleSetPeriod = () => {
    onSetPeriod?.(selectedPeriod)
    setOpen(false)
  }

  const getReportTitle = () => {
    switch (category) {
      case "alertas":
        return "Definir Período - Relatório de Alertas"
      case "equipamentos":
        return "Definir Período - Relatório de Equipamentos"
      case "veiculos":
        return "Definir Período - Relatório de Veículos"
      case "manutencoes":
        return "Definir Período - Relatório de Manutenções"
      case "abastecimentos":
        return "Definir Período - Relatório de Abastecimentos"
      case "colaboradores":
        return "Definir Período - Relatório de Colaboradores"
      default:
        return "Definir Período do Relatório"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[90vh] flex flex-col">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {getReportTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Selecione o período para o relatório
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Seção de Período */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Período do Relatório
              </Label>
              <DatePickerWithRange 
                onPeriodChange={setSelectedPeriod}
                initialPeriod={selectedPeriod}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedPeriod?.from 
                  ? selectedPeriod?.to 
                    ? `Período: ${selectedPeriod.from.toLocaleDateString('pt-BR')} até ${selectedPeriod.to.toLocaleDateString('pt-BR')}`
                    : `Período: a partir de ${selectedPeriod.from.toLocaleDateString('pt-BR')}`
                  : "Selecione um período ou deixe vazio para incluir todos os dados"
                }
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            className="cursor-pointer border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSetPeriod} 
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Definir Período
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
