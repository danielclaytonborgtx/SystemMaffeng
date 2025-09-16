"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })

  const [startDate, setStartDate] = React.useState("01/01/2024")
  const [endDate, setEndDate] = React.useState(new Date().toLocaleDateString("pt-BR"))

  const presetPeriods = [
    {
      label: "Últimos 7 dias",
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(to.getDate() - 7)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    },
    {
      label: "Últimos 30 dias",
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(to.getDate() - 30)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    },
    {
      label: "Últimos 90 dias",
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(to.getDate() - 90)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    },
    {
      label: "Este mês",
      getValue: () => {
        const now = new Date()
        const from = new Date(now.getFullYear(), now.getMonth(), 1)
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    },
    {
      label: "Mês passado",
      getValue: () => {
        const now = new Date()
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const to = new Date(now.getFullYear(), now.getMonth(), 0)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    },
    {
      label: "Este ano",
      getValue: () => {
        const now = new Date()
        const from = new Date(now.getFullYear(), 0, 1)
        const to = new Date(now.getFullYear(), 11, 31)
        return { 
          from, 
          to,
          startDate: from.toLocaleDateString("pt-BR"),
          endDate: to.toLocaleDateString("pt-BR")
        }
      }
    }
  ]

  const handlePresetClick = (preset: any) => {
    const result = preset.getValue()
    setDate({ from: result.from, to: result.to })
    setStartDate(result.startDate)
    setEndDate(result.endDate)
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    const [day, month, year] = value.split('/')
    if (day && month && year) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      setDate(prev => ({ ...prev, from: newDate }))
    }
  }

  const handleEndDateChange = (value: string) => {
    setEndDate(value)
    const [day, month, year] = value.split('/')
    if (day && month && year) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      setDate(prev => ({ ...prev, to: newDate }))
    }
  }

  const formatDateForInput = (date: Date) => {
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Períodos Pré-definidos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Períodos rápidos:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presetPeriods.map((preset) => (
            <Badge
              key={preset.label}
              variant="outline"
              className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-sm px-3 py-1"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Campos de Data Separados */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span className="font-medium">Período personalizado:</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              Data inicial
            </Label>
            <Input
              id="start-date"
              type="text"
              placeholder="DD/MM/AAAA"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              Data final
            </Label>
            <Input
              id="end-date"
              type="text"
              placeholder="DD/MM/AAAA"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          💡 Dica: Use o formato DD/MM/AAAA (ex: 15/03/2024)
        </div>
      </div>

      {/* Resumo do Período Selecionado */}
      {date?.from && date?.to && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-700 font-medium">Período selecionado:</span>
          </div>
          <div className="text-sm text-blue-600">
            {formatDateForInput(date.from)} até {formatDateForInput(date.to)}
          </div>
        </div>
      )}
    </div>
  )
}
