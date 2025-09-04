"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Calendar, FileText, TrendingUp, BarChart3 } from "lucide-react"
import { ReportFiltersDialog } from "@/components/reports/report-filters-dialog"
import { AlertsPanel } from "@/components/reports/alerts-panel"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { usePDFGenerator } from "@/hooks/use-pdf-generator"
import { toast } from "sonner"

export default function RelatoriosPage() {
  const { generatePDF, isGenerating } = usePDFGenerator()

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
      description: "Movimentação, status e utilização dos equipamentos",
      icon: FileText,
      category: "equipamentos",
    },
    {
      title: "Relatório de Manutenções",
      description: "Histórico, custos e próximas manutenções",
      icon: FileText,
      category: "manutencoes",
    },
    {
      title: "Relatório Financeiro",
      description: "Custos, valores e análise de ROI por período",
      icon: TrendingUp,
      category: "financeiro",
    },
    {
      title: "Relatório de Colaboradores",
      description: "Produtividade e equipamentos por funcionário",
      icon: FileText,
      category: "colaboradores",
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
                <div className="flex items-center gap-2">
                  <ReportFiltersDialog category={report.category}>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  </ReportFiltersDialog>
                  <Button 
                    size="sm" 
                    className="cursor-pointer"
                    onClick={() => handleGeneratePDF(report.category, report.title)}
                    disabled={isGenerating}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isGenerating ? "Gerando..." : "Gerar PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="cursor-pointer">
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
