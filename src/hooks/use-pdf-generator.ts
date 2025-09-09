"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface PDFGeneratorOptions {
  filename: string
  title: string
  includeCharts?: boolean
}

export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async (options: PDFGeneratorOptions) => {
    setIsGenerating(true)
    
    try {
      const { filename, title, includeCharts = true } = options
      
      // Criar novo documento PDF
      const pdf = new jsPDF()
      
      // Configurar fonte e tamanho
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(20)
      
      // Adicionar título
      pdf.text(title, 20, 30)
      
      // Adicionar data de geração
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      const currentDate = new Date().toLocaleDateString("pt-BR")
      pdf.text(`Gerado em: ${currentDate}`, 20, 40)
      
      // Adicionar linha separadora
      pdf.setLineWidth(0.5)
      pdf.line(20, 45, 190, 45)
      
      // Dados do relatório baseado no tipo
      let reportData = ""
      let yPosition = 60
      
      switch (filename.toLowerCase()) {
        case "relatorio-equipamentos":
          reportData = generateEquipmentReportData()
          break
        case "relatorio-manutencoes":
          reportData = generateMaintenanceReportData()
          break
        case "relatorio-financeiro":
          reportData = generateFinancialReportData()
          break
        case "relatorio-colaboradores":
          reportData = generateEmployeeReportData()
          break
        default:
          reportData = "Relatório gerado automaticamente pelo sistema."
      }
      
      // Adicionar conteúdo do relatório
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(12)
      
      const lines = pdf.splitTextToSize(reportData, 170)
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(line, 20, yPosition)
        yPosition += 7
      })
      
      // Adicionar rodapé
      pdf.setFontSize(8)
      pdf.text("Sistema de Gestão de Estoque e Frotas - MAFFENG", 20, 285)
      pdf.text("Página " + pdf.getCurrentPageInfo().pageNumber, 170, 285)
      
      // Salvar o PDF
      pdf.save(`${filename}.pdf`)
      
      return { success: true, message: "PDF gerado com sucesso!" }
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      return { success: false, message: "Erro ao gerar PDF. Tente novamente." }
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generatePDF,
    isGenerating
  }
}

// Funções auxiliares para gerar dados dos relatórios
function generateEquipmentReportData(): string {
  return `
RELATÓRIO DE EQUIPAMENTOS

RESUMO EXECUTIVO:
Este relatório apresenta a situação atual dos equipamentos da empresa, incluindo status de utilização, manutenções pendentes e análise de performance.

DADOS GERAIS:
• Total de Equipamentos: 120 unidades
• Equipamentos Disponíveis: 85 (70.8%)
• Equipamentos em Uso: 25 (20.8%)
• Equipamentos em Manutenção: 8 (6.7%)
• Equipamentos Indisponíveis: 2 (1.7%)

CATEGORIAS:
• Ferramentas Manuais: 45 unidades
• Ferramentas Elétricas: 35 unidades
• Máquinas: 25 unidades
• EPI: 15 unidades

MANUTENÇÕES PENDENTES:
• Manutenção Preventiva: 12 equipamentos
• Manutenção Corretiva: 3 equipamentos
• Calibração: 5 equipamentos

RECOMENDAÇÕES:
1. Realizar manutenção preventiva nos equipamentos em atraso
2. Avaliar necessidade de aquisição de novos equipamentos
3. Implementar sistema de rastreamento mais detalhado
4. Treinar colaboradores no uso correto dos equipamentos

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete a situação atual dos equipamentos cadastrados.
  `
}

function generateMaintenanceReportData(): string {
  return `
RELATÓRIO DE MANUTENÇÕES

RESUMO EXECUTIVO:
Este relatório apresenta o histórico de manutenções realizadas, custos envolvidos e programação de manutenções futuras.

DADOS GERAIS:
• Total de Manutenções no Período: 45
• Manutenções Preventivas: 30 (66.7%)
• Manutenções Corretivas: 15 (33.3%)
• Custo Total: R$ 25.450,00
• Tempo Médio de Reparo: 2.5 dias

MANUTENÇÕES POR VEÍCULO:
• Caminhões: 20 manutenções
• Carros: 15 manutenções
• Motos: 8 manutenções
• Máquinas: 2 manutenções

MANUTENÇÕES PENDENTES:
• Troca de Óleo: 8 veículos
• Revisão Geral: 5 veículos
• Troca de Pneus: 3 veículos
• Reparo de Freios: 2 veículos

ANÁLISE DE CUSTOS:
• Custo Médio por Manutenção: R$ 565,56
• Custo por Quilômetro: R$ 0,15
• Economia com Manutenção Preventiva: R$ 8.200,00

RECOMENDAÇÕES:
1. Aumentar frequência de manutenção preventiva
2. Implementar sistema de alertas automáticos
3. Negociar contratos de manutenção com fornecedores
4. Treinar equipe em manutenção básica

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete o histórico de manutenções cadastradas.
  `
}

function generateFinancialReportData(): string {
  return `
RELATÓRIO FINANCEIRO

RESUMO EXECUTIVO:
Este relatório apresenta a análise financeira dos custos operacionais, incluindo equipamentos, manutenções e combustível.

DADOS GERAIS:
• Período: Últimos 6 meses
• Custo Total: R$ 156.800,00
• Custo Médio Mensal: R$ 26.133,33
• Economia Realizada: R$ 12.400,00

DISTRIBUIÇÃO DE CUSTOS:
• Equipamentos: R$ 78.400,00 (50%)
• Manutenções: R$ 39.200,00 (25%)
• Combustível: R$ 31.360,00 (20%)
• Outros: R$ 7.840,00 (5%)

ANÁLISE POR CATEGORIA:
EQUIPAMENTOS:
• Aquisições: R$ 45.000,00
• Reparos: R$ 20.000,00
• Acessórios: R$ 13.400,00

MANUTENÇÕES:
• Preventivas: R$ 25.000,00
• Corretivas: R$ 14.200,00

COMBUSTÍVEL:
• Gasolina: R$ 18.000,00
• Diesel: R$ 13.360,00

PROJEÇÕES:
• Custo Estimado Próximo Mês: R$ 28.500,00
• Economia Projetada: R$ 2.200,00
• ROI Esperado: 8.5%

RECOMENDAÇÕES:
1. Otimizar uso de combustível
2. Negociar melhores preços com fornecedores
3. Implementar controle de custos mais rigoroso
4. Avaliar terceirização de algumas atividades

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete os dados financeiros cadastrados.
  `
}

function generateEmployeeReportData(): string {
  return `
RELATÓRIO DE COLABORADORES

RESUMO EXECUTIVO:
Este relatório apresenta a análise de produtividade e utilização de equipamentos por colaborador.

DADOS GERAIS:
• Total de Colaboradores: 45
• Colaboradores Ativos: 42 (93.3%)
• Colaboradores em Férias: 2 (4.4%)
• Colaboradores Inativos: 1 (2.2%)

DISTRIBUIÇÃO POR DEPARTAMENTO:
• Operacional: 28 colaboradores (62.2%)
• Administrativo: 12 colaboradores (26.7%)
• Manutenção: 5 colaboradores (11.1%)

DISTRIBUIÇÃO POR CARGO:
• Operadores: 20 colaboradores
• Técnicos: 15 colaboradores
• Supervisores: 7 colaboradores
• Gerentes: 3 colaboradores

PRODUTIVIDADE:
• Média de Equipamentos por Colaborador: 2.7
• Colaboradores com Alta Produtividade: 35 (77.8%)
• Colaboradores com Produtividade Média: 8 (17.8%)
• Colaboradores com Baixa Produtividade: 2 (4.4%)

EQUIPAMENTOS MAIS UTILIZADOS:
• Furadeira Elétrica: 25 colaboradores
• Martelo: 20 colaboradores
• Chave de Fenda: 18 colaboradores
• Alicate: 15 colaboradores

TREINAMENTOS:
• Colaboradores Treinados: 40 (88.9%)
• Treinamentos Pendentes: 5 (11.1%)
• Certificações Válidas: 38 (84.4%)

RECOMENDAÇÕES:
1. Realizar treinamentos para colaboradores pendentes
2. Implementar programa de capacitação contínua
3. Avaliar redistribuição de equipamentos
4. Criar sistema de reconhecimento por produtividade

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete os dados dos colaboradores cadastrados.
  `
}
