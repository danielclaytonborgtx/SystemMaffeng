"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Calendar, FileText, Loader2, Check } from "lucide-react"
import { ReportFiltersDialog } from "@/components/reports/report-filters-dialog"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { usePDFGenerator } from "@/hooks/use-pdf-generator"
import { useEmployees, useEquipment, useVehicles, useVehicleMaintenances, useVehicleFuels, useAlerts, useEquipmentMovementsQuery, useVehicleScheduledMaintenances } from "@/hooks"
import { toast } from "sonner"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function RelatoriosPage() {
  const { generatePDF, isGenerating } = usePDFGenerator()
  const { data: employees, loading: employeesLoading } = useEmployees()
  const { data: equipment, loading: equipmentLoading } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading } = useVehicles()
  const { data: maintenances, loading: maintenancesLoading } = useVehicleMaintenances()
  const { data: fuels, loading: fuelsLoading } = useVehicleFuels()
  const { data: movements = [], isLoading: movementsLoading } = useEquipmentMovementsQuery()
  const { data: scheduledMaintenances = [], loading: scheduledMaintenancesLoading } = useVehicleScheduledMaintenances()
  const { alerts, totalAlerts } = useAlerts()

  // Estado para armazenar os períodos definidos por relatório
  const [reportPeriods, setReportPeriods] = useState<Record<string, any>>({})

  // Loading geral - qualquer hook carregando
  const loading = employeesLoading || equipmentLoading || vehiclesLoading || maintenancesLoading || fuelsLoading || movementsLoading || scheduledMaintenancesLoading

  // Função para filtrar dados por data
  const filterDataByDate = (data: any[], dateField: string, dateRange?: any) => {
    if (!dateRange?.from) return data
    
    return data.filter((item) => {
      const itemDate = item[dateField]
      if (!itemDate) return true // Se não tem data, incluir sempre
      
      // Converter para Date se necessário
      const date = itemDate?.toDate ? itemDate.toDate() : new Date(itemDate)
      
      if (dateRange.from && date < dateRange.from) return false
      if (dateRange.to && date > dateRange.to) return false
      
      return true
    })
  }

  // Função para salvar período definido
  const handleSetPeriod = (category: string, period: any) => {
    setReportPeriods(prev => ({
      ...prev,
      [category]: period
    }))
  }

  // Função para verificar se tem período definido
  const hasPeriod = (category: string) => {
    return !!reportPeriods[category]?.from
  }

  const handleGeneratePDF = async (category: string, title: string) => {
    const period = reportPeriods[category]
    
    // Aplicar filtros de data aos dados
            const filteredEmployees = filterDataByDate(employees, 'createdAt', period)
            const filteredEquipment = filterDataByDate(equipment, 'createdAt', period)
            const filteredVehicles = filterDataByDate(vehicles, 'createdAt', period)
            const filteredMaintenances = filterDataByDate(maintenances, 'created_at', period)
            const filteredFuels = filterDataByDate(fuels, 'created_at', period)
            const filteredMovements = filterDataByDate(movements, 'createdAt', period)
            const filteredScheduledMaintenances = filterDataByDate(scheduledMaintenances, 'created_at', period)
            const filteredAlerts = alerts // Alertas serão filtrados no gerador de PDF

    const result = await generatePDF({
      filename: `relatorio-${category}`,
      title: title,
      includeCharts: true,
      period: period, // Passar o período para o gerador de PDF
              data: {
                employees: filteredEmployees,
                equipment: filteredEquipment,
                vehicles: filteredVehicles,
                maintenances: filteredMaintenances,
                fuels: filteredFuels,
                movements: filteredMovements,
                alerts: filteredAlerts,
                scheduledMaintenances: filteredScheduledMaintenances
              }
    })

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const reportTypes = [
    {
      title: "Relatório de Alertas",
      description: `Resumo completo dos ${totalAlerts} alertas ativos do sistema`,
      icon: FileText,
      category: "alertas",
      loading: false,
    },
    {
      title: "Relatório de Equipamentos",
      description: `Movimentação, status e utilização dos ${equipment.length} equipamentos`,
      icon: FileText,
      category: "equipamentos",
      loading: equipmentLoading,
    },
    {
      title: "Relatório de Veículos",
      description: `Status, quilometragem e informações dos ${vehicles.length} veículos`,
      icon: FileText,
      category: "veiculos",
      loading: vehiclesLoading,
    },
    {
      title: "Relatório de Manutenções",
      description: `Histórico, custos e próximas manutenções de ${maintenances.length} registros`,
      icon: FileText,
      category: "manutencoes",
      loading: maintenancesLoading,
    },
    {
      title: "Relatório de Abastecimentos",
      description: `Histórico de combustível e custos de ${fuels.length} abastecimentos`,
      icon: FileText,
      category: "abastecimentos",
      loading: fuelsLoading,
    },
    {
      title: "Relatório de Colaboradores",
      description: `Produtividade e equipamentos por ${employees.length} funcionários`,
      icon: FileText,
      category: "colaboradores",
      loading: employeesLoading,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios detalhados do sistema</p>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ReportsCharts />
      )}

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <report.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {report.title}
                        </CardTitle>
                        {hasPeriod(report.category) && (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 flex items-center gap-1 text-xs">
                            <Check className="h-3 w-3" />
                            Período
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  {loading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    report.description
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-3">
                  <ReportFiltersDialog 
                    category={report.category}
                    currentPeriod={reportPeriods[report.category]}
                    onSetPeriod={(period) => handleSetPeriod(report.category, period)}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {hasPeriod(report.category) ? 'Editar Período' : 'Definir Período'}
                    </Button>
                  </ReportFiltersDialog>
                  <Button 
                    size="sm" 
                    className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => handleGeneratePDF(report.category, report.title)}
                    disabled={isGenerating || report.loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isGenerating ? "Gerando..." : report.loading ? "Carregando..." : "Gerar PDF"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
