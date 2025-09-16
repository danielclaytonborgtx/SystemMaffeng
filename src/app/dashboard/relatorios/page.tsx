"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Calendar, FileText } from "lucide-react"
import { ReportFiltersDialog } from "@/components/reports/report-filters-dialog"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { usePDFGenerator } from "@/hooks/use-pdf-generator"
import { useEmployees, useEquipment, useVehicles, useVehicleMaintenances, useVehicleFuels } from "@/hooks"
import { toast } from "sonner"

export default function RelatoriosPage() {
  const { generatePDF, isGenerating } = usePDFGenerator()
  const { data: employees, loading: employeesLoading } = useEmployees()
  const { data: equipment, loading: equipmentLoading } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading } = useVehicles()
  const { data: maintenances, loading: maintenancesLoading } = useVehicleMaintenances()
  const { data: fuels, loading: fuelsLoading } = useVehicleFuels()

  const handleGeneratePDF = async (category: string, title: string) => {
    const result = await generatePDF({
      filename: `relatorio-${category}`,
      title: title,
      includeCharts: true,
      data: {
        employees,
        equipment,
        vehicles,
        maintenances,
        fuels
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

      <ReportsCharts />

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <report.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {report.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-3">
                  <ReportFiltersDialog category={report.category}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Configurar Filtros
                    </Button>
                  </ReportFiltersDialog>
                  <Button 
                    size="sm" 
                    className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
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
