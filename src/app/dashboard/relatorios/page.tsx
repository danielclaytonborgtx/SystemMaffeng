"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Calendar, FileText, TrendingUp, BarChart3 } from "lucide-react"
import { ReportFiltersDialog } from "@/components/reports/report-filters-dialog"
import { AlertsPanel } from "@/components/reports/alerts-panel"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { usePDFGenerator } from "@/hooks/use-pdf-generator"
import { useEmployees, useEquipment, useVehicles } from "@/hooks"
import { toast } from "sonner"

export default function RelatoriosPage() {
  const { generatePDF, isGenerating } = usePDFGenerator()
  const { data: employees, loading: employeesLoading } = useEmployees()
  const { data: equipment, loading: equipmentLoading } = useEquipment()
  const { data: vehicles, loading: vehiclesLoading } = useVehicles()

  const handleGeneratePDF = async (category: string, title: string) => {
    const result = await generatePDF({
      filename: `relatorio-${category}`,
      title: title,
      includeCharts: true
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
      title: "Relatório de Manutenções",
      description: `Histórico, custos e próximas manutenções de ${vehicles.length} veículos`,
      icon: FileText,
      category: "manutencoes",
      loading: vehiclesLoading,
    },
    {
      title: "Relatório Financeiro",
      description: "Custos, valores e análise de ROI por período",
      icon: TrendingUp,
      category: "financeiro",
      loading: false,
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
        <h1 className="text-3xl font-bold text-foreground">Relatórios e Alertas</h1>
        <p className="text-muted-foreground">Gere relatórios detalhados e monitore alertas do sistema</p>
      </div>

      <AlertsPanel />

      <ReportsCharts />

      <div>
        <h2 className="text-xl font-semibold mb-4">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <report.icon className="h-5 w-5" />
                  {report.title}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <ReportFiltersDialog category={report.category}>
                    <Button variant="outline" size="sm" className="cursor-pointer flex-1 sm:flex-none py-3 sm:py-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Configurar</span>
                      <span className="sm:hidden">Filtros</span>
                    </Button>
                  </ReportFiltersDialog>
                  <Button 
                    size="sm" 
                    className="cursor-pointer bg-gray-800 text-white hover:bg-gray-700 flex-1 sm:flex-none py-3 sm:py-2"
                    onClick={() => handleGeneratePDF(report.category, report.title)}
                    disabled={isGenerating || report.loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isGenerating ? "Gerando..." : report.loading ? "Carregando..." : "Gerar PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="cursor-pointer flex-1 sm:flex-none py-3 sm:py-2">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Visualizar
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
