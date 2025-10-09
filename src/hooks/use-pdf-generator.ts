"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface PDFGeneratorOptions {
  filename: string
  title: string
  includeCharts?: boolean
  period?: {
    from?: Date
    to?: Date
  }
  data?: {
    employees?: any[]
    equipment?: any[]
    vehicles?: any[]
    maintenances?: any[]
    fuels?: any[]
    alerts?: any[]
    movements?: any[]
  }
}

export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async (options: PDFGeneratorOptions) => {
    setIsGenerating(true)
    
    try {
      const { filename, title, includeCharts = true, data } = options
      
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
              case "relatorio-alertas":
                reportData = generateAlertsReportData(data?.alerts || [], options.period)
                break
        case "relatorio-equipamentos":
          reportData = generateEquipmentReportData(data?.equipment || [], data?.movements || [], options.period)
          break
        case "relatorio-veiculos":
          reportData = generateVehicleReportData(data?.vehicles || [])
          break
        case "relatorio-manutencoes":
          reportData = generateMaintenanceReportData(data?.maintenances || [])
          break
        case "relatorio-abastecimentos":
          reportData = generateFuelReportData(data?.fuels || [])
          break
        case "relatorio-colaboradores":
          reportData = generateEmployeeReportData(data?.employees || [])
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
      pdf.text("Página 1", 170, 285)
      
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
function generateAlertsReportData(alerts: any[], period?: { from?: Date; to?: Date }): string {
  // Filtrar alertas por período se especificado
  let filteredAlerts = alerts
  
  if (period?.from || period?.to) {
    filteredAlerts = alerts.filter(alert => {
      // Para alertas que têm data específica (como manutenções, seguros, etc.)
      if (alert.daysOverdue !== undefined) {
        const alertDate = new Date()
        alertDate.setDate(alertDate.getDate() - (alert.daysOverdue || 0))
        
        if (period.from && alertDate < period.from) return false
        if (period.to && alertDate > period.to) return false
        
        return true
      }
      
      // Para alertas sem data específica (como equipamentos disponíveis), incluir sempre
      return true
    })
  }

  const total = filteredAlerts.length
  const critical = filteredAlerts.filter(a => a.type === 'critical' || a.type === 'urgent').length
  const warning = filteredAlerts.filter(a => a.type === 'warning').length
  const info = filteredAlerts.filter(a => a.type === 'info').length

  // Agrupar por categoria
  const categories = filteredAlerts.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryText = Object.entries(categories)
    .map(([category, count]) => `• ${category}: ${count} alerta(s) (${total > 0 ? (((count as number) / total) * 100).toFixed(1) : 0}%)`)
    .join('\n')

  // Listar alertas críticos
  const criticalAlerts = filteredAlerts.filter(a => a.type === 'critical' || a.type === 'urgent')
  const criticalText = criticalAlerts.length > 0
    ? criticalAlerts.map(a => `• ${a.title} - ${a.description}`).join('\n')
    : '• Nenhum alerta crítico no período selecionado'

  // Listar alertas de atenção
  const warningAlerts = filteredAlerts.filter(a => a.type === 'warning')
  const warningText = warningAlerts.length > 0
    ? warningAlerts.slice(0, 5).map(a => `• ${a.title} - ${a.description}`).join('\n')
    : '• Nenhum alerta de atenção no período selecionado'

  // Formatação do período
  const periodText = period?.from && period?.to
    ? `${period.from.toLocaleDateString('pt-BR')} até ${period.to.toLocaleDateString('pt-BR')}`
    : period?.from
    ? `A partir de ${period.from.toLocaleDateString('pt-BR')}`
    : period?.to
    ? `Até ${period.to.toLocaleDateString('pt-BR')}`
    : 'Todos os alertas ativos'

  return `
RELATÓRIO DE ALERTAS DO SISTEMA

PERÍODO DO RELATÓRIO:
${periodText}

RESUMO EXECUTIVO:
Este relatório apresenta um panorama completo dos alertas ${period ? 'do período selecionado' : 'ativos no sistema'}, incluindo alertas críticos, avisos e informações importantes que requerem atenção.

DADOS GERAIS:
• Total de Alertas ${period ? 'no Período' : 'Ativos'}: ${total}
• Alertas Críticos: ${critical} (${total > 0 ? ((critical / total) * 100).toFixed(1) : 0}%)
• Alertas de Atenção: ${warning} (${total > 0 ? ((warning / total) * 100).toFixed(1) : 0}%)
• Alertas Informativos: ${info} (${total > 0 ? ((info / total) * 100).toFixed(1) : 0}%)

DISTRIBUIÇÃO POR CATEGORIA:
${categoryText || '• Nenhuma categoria encontrada no período'}

ALERTAS CRÍTICOS (Ação Urgente Necessária):
${criticalText}

ALERTAS DE ATENÇÃO (Próximos ${Math.min(5, warningAlerts.length)}):
${warningText}

DETALHAMENTO POR CATEGORIA:
${Object.entries(categories).map(([category, count]) => {
  const categoryAlerts = filteredAlerts.filter(a => a.category === category)
  const categoryText = categoryAlerts.map(a => `  - ${a.title}: ${a.description}`).join('\n')
  const countNum = count as number
  return `\n${category.toUpperCase()} (${countNum} alerta${countNum > 1 ? 's' : ''}):\n${categoryText || '  - Nenhum alerta nesta categoria'}`
}).join('\n')}

ANÁLISE DE PRIORIDADE:
• Nível Crítico: ${critical} alerta(s) - Requer ação imediata
• Nível Atenção: ${warning} alerta(s) - Requer planejamento
• Nível Info: ${info} alerta(s) - Para conhecimento

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema ${period ? 'para o período especificado' : 'com base nos alertas ativos'}. É recomendado revisar este relatório periodicamente para garantir que todas as ações necessárias sejam tomadas em tempo hábil.
  `
}

function generateEquipmentReportData(equipment: any[], movements: any[], period?: { from?: Date; to?: Date }): string {
  const total = equipment.length
  const available = equipment.filter(e => e.status === 'available').length
  const inUse = equipment.filter(e => e.status === 'in_use').length
  const maintenance = equipment.filter(e => e.status === 'maintenance').length

  // Filtrar movimentações por período se especificado
  let filteredMovements = movements
  
  if (period?.from || period?.to) {
    filteredMovements = movements.filter(movement => {
      const movementDate = new Date(movement.created_at)
      
      if (period.from && movementDate < period.from) return false
      if (period.to && movementDate > period.to) return false
      
      return true
    })
  }

  // Debug: log das movimentações
  console.log('=== DEBUG MOVIMENTAÇÕES PDF ===')
  console.log('Total de movimentações:', filteredMovements.length)
  console.log('Primeiras 5 movimentações:', filteredMovements.slice(0, 5))
  console.log('Tipos encontrados:', [...new Set(filteredMovements.map(m => m.type))])
  
  // Estatísticas de movimentações
  const totalMovements = filteredMovements.length
  const exitMovements = filteredMovements.filter(m => m.type === 'out').length
  const returnMovements = filteredMovements.filter(m => m.type === 'return').length
  
  // Contar devoluções baseado em actual_return_date (já que devoluções atualizam a movimentação existente)
  const actualReturns = filteredMovements.filter(m => m.type === 'out' && m.actual_return_date).length
  
  console.log('Saídas (type=out):', exitMovements)
  console.log('Devoluções (type=return):', returnMovements)
  console.log('Devoluções (actual_return_date):', actualReturns)
  
  const pendingReturns = filteredMovements.filter(m => {
    const isExit = m.type === 'out'
    const hasReturn = filteredMovements.some(r => 
      r.equipment_id === m.equipment_id && 
      r.type === 'return' &&
      new Date(r.created_at) > new Date(m.created_at)
    )
    return isExit && !hasReturn && !m.actual_return_date
  }).length
  
  console.log('Devoluções pendentes:', pendingReturns)
  console.log('=== FIM DEBUG MOVIMENTAÇÕES PDF ===')

  // Movimentações recentes
  const recentMovements = filteredMovements
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  // Formatação do período
  const periodText = period?.from && period?.to
    ? `${period.from.toLocaleDateString('pt-BR')} até ${period.to.toLocaleDateString('pt-BR')}`
    : period?.from
    ? `A partir de ${period.from.toLocaleDateString('pt-BR')}`
    : period?.to
    ? `Até ${period.to.toLocaleDateString('pt-BR')}`
    : 'Todos os equipamentos cadastrados'

  return `
RELATÓRIO DE EQUIPAMENTOS

PERÍODO DO RELATÓRIO:
${periodText}

RESUMO EXECUTIVO:
Este relatório apresenta a situação ${period ? 'do período selecionado' : 'atual'} dos equipamentos da empresa, incluindo status de utilização e histórico de movimentações.

DADOS GERAIS:
• Total de Equipamentos: ${total} unidades
• Equipamentos Disponíveis: ${available} (${total > 0 ? ((available / total) * 100).toFixed(1) : 0}%)
• Equipamentos em Uso: ${inUse} (${total > 0 ? ((inUse / total) * 100).toFixed(1) : 0}%)
• Equipamentos em Manutenção: ${maintenance} (${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%)

RELATÓRIO DE MOVIMENTAÇÕES:
• Total de Movimentações ${period ? 'no Período' : ''}: ${totalMovements}
• Saídas de Equipamentos: ${exitMovements}
• Devoluções de Equipamentos: ${actualReturns}
• Devoluções Pendentes: ${pendingReturns}

MOVIMENTAÇÕES RECENTES ${period ? 'DO PERÍODO' : ''}:
${recentMovements.length > 0 
  ? recentMovements.map(m => {
      // Determinar tipo baseado em actual_return_date ou type
      let movementType = 'SAÍDA'
      let date = new Date(m.created_at).toLocaleDateString('pt-BR')
      
      if (m.actual_return_date) {
        movementType = 'DEVOLUÇÃO'
        date = new Date(m.actual_return_date).toLocaleDateString('pt-BR')
      } else if (m.type === 'return') {
        movementType = 'DEVOLUÇÃO'
      }
      
      const equipmentName = equipment.find(e => e.id === m.equipment_id)?.name || 'Equipamento não encontrado'
      const responsible = m.employee_name || m.employee_code || 'Responsável não informado'
      return `• ${movementType} - ${equipmentName} - ${date} - ${responsible}`
    }).join('\n')
  : '• Nenhuma movimentação no período selecionado'
}

ANÁLISE DE UTILIZAÇÃO:
• Taxa de Utilização: ${total > 0 ? ((inUse / total) * 100).toFixed(1) : 0}%
• Taxa de Disponibilidade: ${total > 0 ? ((available / total) * 100).toFixed(1) : 0}%
• Taxa de Manutenção: ${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema ${period ? 'para o período especificado' : 'com base nos dados atuais'} e reflete a situação dos equipamentos e suas movimentações.
  `
}

function generateMaintenanceReportData(maintenances: any[]): string {
  const total = maintenances.length
  const preventive = maintenances.filter(m => m.type === 'Preventiva').length
  const corrective = maintenances.filter(m => m.type === 'Corretiva').length
  const predictive = maintenances.filter(m => m.type === 'Preditiva').length

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
  const avgCost = total > 0 ? totalCost / total : 0

  // Agrupar por tipo de veículo
  const vehicleTypes = maintenances.reduce((acc, item) => {
    const vehicleType = item.vehicleType || 'Não informado'
    acc[vehicleType] = (acc[vehicleType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const vehicleTypeText = Object.entries(vehicleTypes)
    .map(([type, count]) => `• ${type}: ${count} manutenções`)
    .join('\n')

  return `
RELATÓRIO DE MANUTENÇÕES

RESUMO EXECUTIVO:
Este relatório apresenta o histórico de manutenções realizadas, custos envolvidos e programação de manutenções futuras.

DADOS GERAIS:
• Total de Manutenções no Período: ${total}
• Manutenções Preventivas: ${preventive} (${total > 0 ? ((preventive / total) * 100).toFixed(1) : 0}%)
• Manutenções Corretivas: ${corrective} (${total > 0 ? ((corrective / total) * 100).toFixed(1) : 0}%)
• Manutenções Preditivas: ${predictive} (${total > 0 ? ((predictive / total) * 100).toFixed(1) : 0}%)
• Custo Total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Custo Médio por Manutenção: R$ ${avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

MANUTENÇÕES POR TIPO DE VEÍCULO:
${vehicleTypeText || '• Nenhuma manutenção encontrada'}

MANUTENÇÕES RECENTES:
${maintenances.slice(0, 5).map(m => `• ${m.description || 'Sem descrição'} - ${m.type} - R$ ${(m.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n') || '• Nenhuma manutenção cadastrada'}

ANÁLISE DE CUSTOS:
• Custo Total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Custo Médio por Manutenção: R$ ${avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Manutenções com Custo: ${maintenances.filter(m => m.cost && m.cost > 0).length}

RECOMENDAÇÕES:
1. Aumentar frequência de manutenção preventiva
2. Implementar sistema de alertas automáticos
3. Negociar contratos de manutenção com fornecedores
4. Treinar equipe em manutenção básica

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete o histórico de manutenções cadastradas.
  `
}


function generateEmployeeReportData(employees: any[]): string {
  const total = employees.length
  const active = employees.filter(e => e.status === 'active').length
  const inactive = employees.filter(e => e.status === 'inactive').length
  const onVacation = employees.filter(e => e.status === 'vacation').length
  const away = employees.filter(e => e.status === 'away').length

  // Agrupar por departamento
  const departments = employees.reduce((acc, item) => {
    const dept = item.department || 'Não informado'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const departmentText = Object.entries(departments)
    .map(([dept, count]) => `• ${dept}: ${count} colaboradores (${total > 0 ? (((count as number) / total) * 100).toFixed(1) : 0}%)`)
    .join('\n')

  // Agrupar por cargo
  const positions = employees.reduce((acc, item) => {
    const position = item.position || 'Não informado'
    acc[position] = (acc[position] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const positionText = Object.entries(positions)
    .map(([position, count]) => `• ${position}: ${count} colaboradores`)
    .join('\n')

  return `
RELATÓRIO DE COLABORADORES

RESUMO EXECUTIVO:
Este relatório apresenta a análise de produtividade e utilização de equipamentos por colaborador.

DADOS GERAIS:
• Total de Colaboradores: ${total}
• Colaboradores Ativos: ${active} (${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%)
• Colaboradores Inativos: ${inactive} (${total > 0 ? ((inactive / total) * 100).toFixed(1) : 0}%)
• Colaboradores em Férias: ${onVacation} (${total > 0 ? ((onVacation / total) * 100).toFixed(1) : 0}%)
• Colaboradores Afastados: ${away} (${total > 0 ? ((away / total) * 100).toFixed(1) : 0}%)

DISTRIBUIÇÃO POR DEPARTAMENTO:
${departmentText || '• Nenhum departamento encontrado'}

DISTRIBUIÇÃO POR CARGO:
${positionText || '• Nenhum cargo encontrado'}

COLABORADORES RECENTES:
${employees.slice(0, 5).map(e => `• ${e.name} - ${e.position || 'Sem cargo'} - ${e.department || 'Sem departamento'}`).join('\n') || '• Nenhum colaborador cadastrado'}

ANÁLISE DE STATUS:
• Colaboradores Ativos: ${active}
• Colaboradores Inativos: ${inactive}
• Colaboradores em Férias: ${onVacation}
• Colaboradores Afastados: ${away}
• Taxa de Atividade: ${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%

RECOMENDAÇÕES:
1. Realizar treinamentos para colaboradores pendentes
2. Implementar programa de capacitação contínua
3. Avaliar redistribuição de equipamentos
4. Criar sistema de reconhecimento por produtividade

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete os dados dos colaboradores cadastrados.
  `
}

function generateVehicleReportData(vehicles: any[]): string {
  const total = vehicles.length
  const active = vehicles.filter(v => v.status === 'Ativo').length
  const inactive = vehicles.filter(v => v.status === 'Inativo').length
  const maintenance = vehicles.filter(v => v.status === 'Manutenção').length

  // Agrupar por tipo
  const types = vehicles.reduce((acc, item) => {
    const type = item.type || 'Não informado'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeText = Object.entries(types)
    .map(([type, count]) => `• ${type}: ${count} veículos`)
    .join('\n')

  // Calcular quilometragem média
  const vehiclesWithKm = vehicles.filter(v => v.currentKm && v.currentKm > 0)
  const avgKm = vehiclesWithKm.length > 0 
    ? vehiclesWithKm.reduce((sum, v) => sum + v.currentKm, 0) / vehiclesWithKm.length 
    : 0

  // Calcular valor total da frota
  const totalValue = vehicles.reduce((sum, v) => sum + (v.purchaseValue || 0), 0)

  return `
RELATÓRIO DE VEÍCULOS

RESUMO EXECUTIVO:
Este relatório apresenta a situação atual da frota de veículos, incluindo status, quilometragem e informações gerais.

DADOS GERAIS:
• Total de Veículos: ${total}
• Veículos Ativos: ${active} (${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%)
• Veículos Inativos: ${inactive} (${total > 0 ? ((inactive / total) * 100).toFixed(1) : 0}%)
• Veículos em Manutenção: ${maintenance} (${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%)

DISTRIBUIÇÃO POR TIPO:
${typeText || '• Nenhum tipo encontrado'}

ANÁLISE DE QUILOMETRAGEM:
• Veículos com KM Registrado: ${vehiclesWithKm.length}
• Quilometragem Média: ${avgKm.toLocaleString('pt-BR')} km
• Quilometragem Total: ${vehiclesWithKm.reduce((sum, v) => sum + v.currentKm, 0).toLocaleString('pt-BR')} km

ANÁLISE FINANCEIRA:
• Valor Total da Frota: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Valor Médio por Veículo: R$ ${total > 0 ? (totalValue / total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}

VEÍCULOS RECENTES:
${vehicles.slice(0, 5).map(v => `• ${v.plate} - ${v.model} - ${v.type} - ${v.status}`).join('\n') || '• Nenhum veículo cadastrado'}

RECOMENDAÇÕES:
1. Realizar manutenção preventiva nos veículos com alta quilometragem
2. Avaliar necessidade de renovação da frota
3. Implementar sistema de controle de combustível
4. Treinar motoristas em direção econômica

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete a situação atual dos veículos cadastrados.
  `
}

function generateFuelReportData(fuels: any[]): string {
  const total = fuels.length
  const totalLiters = fuels.reduce((sum, f) => sum + (f.liters || 0), 0)
  const totalCost = fuels.reduce((sum, f) => sum + (f.cost || 0), 0)
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

  // Agrupar por tipo de combustível
  const fuelTypes = fuels.reduce((acc, item) => {
    const type = item.fuelType || 'Não informado'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const fuelTypeText = Object.entries(fuelTypes)
    .map(([type, count]) => `• ${type}: ${count} abastecimentos`)
    .join('\n')

  // Calcular consumo médio
  const avgLitersPerFill = total > 0 ? totalLiters / total : 0
  const avgCostPerFill = total > 0 ? totalCost / total : 0

  return `
RELATÓRIO DE ABASTECIMENTOS

RESUMO EXECUTIVO:
Este relatório apresenta o histórico de abastecimentos, custos de combustível e análise de consumo.

DADOS GERAIS:
• Total de Abastecimentos: ${total}
• Total de Litros: ${totalLiters.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
• Custo Total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Preço Médio por Litro: R$ ${avgPricePerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}

DISTRIBUIÇÃO POR TIPO DE COMBUSTÍVEL:
${fuelTypeText || '• Nenhum tipo de combustível encontrado'}

ANÁLISE DE CONSUMO:
• Média de Litros por Abastecimento: ${avgLitersPerFill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
• Custo Médio por Abastecimento: R$ ${avgCostPerFill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Abastecimentos com Custo: ${fuels.filter(f => f.cost && f.cost > 0).length}

ABASTECIMENTOS RECENTES:
${fuels.slice(0, 5).map(f => `• ${f.liters || 0}L - ${f.fuelType || 'Não informado'} - R$ ${(f.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n') || '• Nenhum abastecimento cadastrado'}

ANÁLISE DE CUSTOS:
• Custo Total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Custo Médio por Litro: R$ ${avgPricePerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
• Economia Potencial: R$ ${(totalCost * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (10% de economia)

RECOMENDAÇÕES:
1. Implementar controle de consumo por veículo
2. Negociar preços com postos parceiros
3. Treinar motoristas em direção econômica
4. Implementar sistema de alertas de abastecimento

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema e reflete o histórico de abastecimentos cadastrados.
  `
}
