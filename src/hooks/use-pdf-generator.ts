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
    scheduledMaintenances?: any[]
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
      
      // Adicionar data de geração e período
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      const currentDate = new Date().toLocaleDateString("pt-BR")
      
      // Formatar período se existir
      let periodText = ""
      if (options.period?.from || options.period?.to) {
        if (options.period.from && options.period.to) {
          periodText = ` | Período: ${options.period.from.toLocaleDateString('pt-BR')} até ${options.period.to.toLocaleDateString('pt-BR')}`
        } else if (options.period.from) {
          periodText = ` | Período: a partir de ${options.period.from.toLocaleDateString('pt-BR')}`
        } else if (options.period.to) {
          periodText = ` | Período: até ${options.period.to.toLocaleDateString('pt-BR')}`
        }
      }
      
      pdf.text(`Gerado em: ${currentDate}${periodText}`, 20, 40)
      
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
          reportData = generateVehicleReportData(
            data?.vehicles || [], 
            data?.maintenances || [], 
            data?.fuels || [], 
            data?.scheduledMaintenances || [], 
            options.period
          )
          break
        case "relatorio-manutencoes":
          reportData = generateMaintenanceReportData(data?.maintenances || [], data?.vehicles || [], data?.scheduledMaintenances || [])
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

  // Estatísticas de movimentações
  const totalMovements = filteredMovements.length
  const exitMovements = filteredMovements.filter(m => m.type === 'out').length
  const returnMovements = filteredMovements.filter(m => m.type === 'return').length
  
  // Contar devoluções baseado em actual_return_date (já que devoluções atualizam a movimentação existente)
  const actualReturns = filteredMovements.filter(m => m.type === 'out' && m.actual_return_date).length
  
  const pendingReturns = filteredMovements.filter(m => {
    const isExit = m.type === 'out'
    const hasReturn = filteredMovements.some(r => 
      r.equipment_id === m.equipment_id && 
      r.type === 'return' &&
      new Date(r.created_at) > new Date(m.created_at)
    )
    return isExit && !hasReturn && !m.actual_return_date
  }).length

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

function generateVehicleReportData(vehicles: any[], maintenances: any[], fuels: any[], scheduledMaintenances: any[], period?: { from?: Date; to?: Date }): string {
  const total = vehicles.length
  const active = vehicles.filter(v => v.status === 'active').length
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length
  const retired = vehicles.filter(v => v.status === 'retired').length

  // Filtrar manutenções por período se especificado
  let filteredMaintenances = maintenances
  if (period?.from || period?.to) {
    filteredMaintenances = maintenances.filter(maintenance => {
      const maintenanceDate = new Date(maintenance.created_at)
      
      if (period.from && maintenanceDate < period.from) return false
      if (period.to && maintenanceDate > period.to) return false
      
      return true
    })
  }

  // Filtrar abastecimentos por período se especificado
  let filteredFuels = fuels
  if (period?.from || period?.to) {
    filteredFuels = fuels.filter(fuel => {
      const fuelDate = new Date(fuel.created_at)
      
      if (period.from && fuelDate < period.from) return false
      if (period.to && fuelDate > period.to) return false
      
      return true
    })
  }

  // Estatísticas de manutenções
  const totalMaintenances = filteredMaintenances.length
  const preventiveMaintenances = filteredMaintenances.filter(m => m.type === 'preventiva').length
  const correctiveMaintenances = filteredMaintenances.filter(m => m.type === 'corretiva').length
  const predictiveMaintenances = filteredMaintenances.filter(m => m.type === 'preditiva').length
  const totalMaintenanceCost = filteredMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0)

  // Estatísticas de abastecimentos
  const totalFuels = filteredFuels.length
  const totalLiters = filteredFuels.reduce((sum, f) => sum + (f.liters || 0), 0)
  const totalFuelCost = filteredFuels.reduce((sum, f) => sum + (f.cost || 0), 0)
  const avgPricePerLiter = totalLiters > 0 ? totalFuelCost / totalLiters : 0

  // Calcular quilometragem total atual
  const totalCurrentKm = vehicles.reduce((sum, v) => sum + (v.current_km || 0), 0)
  const avgCurrentKm = total > 0 ? totalCurrentKm / total : 0

  // Manutenções programadas ativas
  const activeScheduledMaintenances = scheduledMaintenances.filter(sm => sm.is_active)
  const overdueMaintenances = activeScheduledMaintenances.filter(sm => {
    const vehicle = vehicles.find(v => v.id === sm.vehicle_id)
    return vehicle && sm.next_maintenance_km <= (vehicle.current_km || 0)
  })

  // Formatação do período
  const periodText = period?.from && period?.to
    ? `${period.from.toLocaleDateString('pt-BR')} até ${period.to.toLocaleDateString('pt-BR')}`
    : period?.from
    ? `A partir de ${period.from.toLocaleDateString('pt-BR')}`
    : period?.to
    ? `Até ${period.to.toLocaleDateString('pt-BR')}`
    : 'Todos os veículos cadastrados'

  return `
RELATÓRIO DE VEÍCULOS

RESUMO EXECUTIVO:
Este relatório apresenta a situação ${period ? 'do período selecionado' : 'atual'} da frota de veículos, incluindo status, manutenções realizadas e abastecimentos registrados.

DADOS GERAIS DA FROTA:
• Total de Veículos: ${total} unidades
• Veículos Ativos: ${active} (${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%)
• Veículos em Manutenção: ${maintenance} (${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%)
• Veículos Inativos: ${retired} (${total > 0 ? ((retired / total) * 100).toFixed(1) : 0}%)
• Quilometragem Total Atual: ${totalCurrentKm.toLocaleString('pt-BR')} km
• Quilometragem Média: ${avgCurrentKm.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km

RELATÓRIO DE MANUTENÇÕES ${period ? 'DO PERÍODO' : ''}:
• Total de Manutenções: ${totalMaintenances}
• Manutenções Preventivas: ${preventiveMaintenances}
• Manutenções Corretivas: ${correctiveMaintenances}
• Manutenções Preditivas: ${predictiveMaintenances}
• Custo Total de Manutenções: R$ ${totalMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

MANUTENÇÕES PROGRAMADAS:
• Total de Manutenções Programadas Ativas: ${activeScheduledMaintenances.length}
• Manutenções Vencidas: ${overdueMaintenances.length}

MANUTENÇÕES RECENTES ${period ? 'DO PERÍODO' : ''}:
${filteredMaintenances.length > 0 
  ? filteredMaintenances
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(m => {
        const vehicle = vehicles.find(v => v.id === m.vehicle_id)
        const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado'
        const date = new Date(m.created_at).toLocaleDateString('pt-BR')
        const cost = m.cost ? `R$ ${m.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Custo não informado'
        return `• ${m.description} - ${vehicleInfo} - ${date} - ${cost}`
      }).join('\n')
  : '• Nenhuma manutenção no período selecionado'
}

RELATÓRIO DE ABASTECIMENTOS ${period ? 'DO PERÍODO' : ''}:
• Total de Abastecimentos: ${totalFuels}
• Litros Abastecidos: ${totalLiters.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L
• Custo Total: R$ ${totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Preço Médio por Litro: R$ ${avgPricePerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}

ABASTECIMENTOS RECENTES ${period ? 'DO PERÍODO' : ''}:
${filteredFuels.length > 0 
  ? filteredFuels
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(f => {
        const vehicle = vehicles.find(v => v.id === f.vehicle_id)
        const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado'
        const date = new Date(f.created_at).toLocaleDateString('pt-BR')
        const consumption = f.consumption ? `${f.consumption.toFixed(2)} km/L` : 'Consumo não calculado'
        return `• ${f.liters}L - ${vehicleInfo} - ${date} - ${consumption}`
      }).join('\n')
  : '• Nenhum abastecimento no período selecionado'
}

ANÁLISE DE EFICIÊNCIA:
• Taxa de Utilização: ${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%
• Taxa de Disponibilidade: ${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%
• Taxa de Manutenção: ${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%
• Custo Médio por Km: R$ ${totalCurrentKm > 0 ? (totalMaintenanceCost / totalCurrentKm).toLocaleString('pt-BR', { minimumFractionDigits: 4 }) : '0,0000'}

OBSERVAÇÕES:
Este relatório foi gerado automaticamente pelo sistema ${period ? 'para o período especificado' : 'com base nos dados atuais'} e reflete a situação da frota, manutenções e abastecimentos.
  `
}

function generateMaintenanceReportData(maintenances: any[], vehicles: any[] = [], scheduledMaintenances: any[] = []): string {
  const total = maintenances.length
  const preventive = maintenances.filter(m => m.type === 'preventiva').length
  const corrective = maintenances.filter(m => m.type === 'corretiva').length
  const predictive = maintenances.filter(m => m.type === 'preditiva').length

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
  const avgCost = total > 0 ? totalCost / total : 0

  // Agrupar por veículo
  const byVehicle = maintenances.reduce((acc, m) => {
    const vehicleKey = m.vehicle_plate || 'Não informado'
    if (!acc[vehicleKey]) {
      acc[vehicleKey] = {
        plate: m.vehicle_plate,
        model: m.vehicle_model,
        count: 0,
        totalCost: 0,
        maintenances: []
      }
    }
    acc[vehicleKey].count++
    acc[vehicleKey].totalCost += (m.cost || 0)
    acc[vehicleKey].maintenances.push(m)
    return acc
  }, {} as Record<string, any>)

  // Ordenar veículos por quantidade de manutenções
  const sortedVehicles = Object.values(byVehicle).sort((a: any, b: any) => b.count - a.count)

  // Estatísticas por tipo
  const costByType = {
    preventiva: maintenances.filter(m => m.type === 'preventiva').reduce((sum, m) => sum + (m.cost || 0), 0),
    corretiva: maintenances.filter(m => m.type === 'corretiva').reduce((sum, m) => sum + (m.cost || 0), 0),
    preditiva: maintenances.filter(m => m.type === 'preditiva').reduce((sum, m) => sum + (m.cost || 0), 0)
  }

  // Itens mais utilizados
  const allItems: string[] = []
  maintenances.forEach(m => {
    if (m.items && Array.isArray(m.items)) {
      allItems.push(...m.items)
    }
  })
  
  const itemFrequency = allItems.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topItems = Object.entries(itemFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([item, count]) => `• ${item}: ${count} vezes`)
    .join('\n')

  // Manutenções mais caras
  const topExpensive = [...maintenances]
    .sort((a, b) => (b.cost || 0) - (a.cost || 0))
    .slice(0, 10)
    .map(m => {
      const date = new Date(m.created_at).toLocaleDateString('pt-BR')
      const vehicle = `${m.vehicle_plate} - ${m.vehicle_model}`
      const cost = `R$ ${(m.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      return `• ${date} - ${vehicle} - ${m.description} - ${cost}`
    })
    .join('\n')

  // Histórico completo detalhado (últimas 20)
  const detailedHistory = [...maintenances]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((m, index) => {
      const date = new Date(m.created_at).toLocaleDateString('pt-BR')
      const vehicle = `${m.vehicle_plate || 'N/A'} - ${m.vehicle_model || 'N/A'}`
      const type = m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : 'N/A'
      const km = m.current_km ? `${m.current_km.toLocaleString('pt-BR')} km` : 'N/A'
      const cost = m.cost ? `R$ ${m.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'
      const nextKm = m.next_maintenance_km ? `${m.next_maintenance_km.toLocaleString('pt-BR')} km` : 'Não programada'
      
      let itemsList = ''
      if (m.items && Array.isArray(m.items) && m.items.length > 0) {
        itemsList = '\n  Itens: ' + m.items.slice(0, 3).join(', ')
        if (m.items.length > 3) itemsList += ` (+${m.items.length - 3} mais)`
      }
      
      let obs = ''
      if (m.observations) {
        obs = '\n  Obs: ' + m.observations.substring(0, 100)
        if (m.observations.length > 100) obs += '...'
      }
      
      return `${index + 1}. ${date} - ${vehicle}
  Tipo: ${type} | KM: ${km} | Custo: ${cost}
  Descrição: ${m.description || 'Sem descrição'}${itemsList}
  Próxima Manutenção: ${nextKm}${obs}`
    })
    .join('\n\n')

  // Análise por veículo
  const vehicleAnalysis = sortedVehicles.slice(0, 10).map((v: any) => {
    const avgCostVehicle = v.totalCost / v.count
    return `• ${v.plate} - ${v.model}: ${v.count} manutenções - Total: R$ ${v.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - Média: R$ ${avgCostVehicle.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }).join('\n')

  // Análise de manutenções programadas
  const activeScheduled = scheduledMaintenances.filter(sm => sm.is_active)
  const totalScheduled = activeScheduled.length
  
  // Manutenções vencidas e próximas
  const overdueScheduled = activeScheduled.filter(sm => {
    const vehicle = vehicles.find(v => v.id === sm.vehicle_id)
    return vehicle && sm.next_maintenance_km <= (vehicle.current_km || 0)
  })
  
  const upcomingScheduled = activeScheduled.filter(sm => {
    const vehicle = vehicles.find(v => v.id === sm.vehicle_id)
    if (!vehicle) return false
    const kmRemaining = sm.next_maintenance_km - (vehicle.current_km || 0)
    return kmRemaining > 0 && kmRemaining <= 1000
  })

  // Listar manutenções programadas por veículo
  const scheduledByVehicle = activeScheduled.reduce((acc, sm) => {
    const vehicleId = sm.vehicle_id
    if (!acc[vehicleId]) {
      const vehicle = vehicles.find(v => v.id === vehicleId)
      acc[vehicleId] = {
        plate: vehicle?.plate || 'N/A',
        model: vehicle?.model || 'N/A',
        currentKm: vehicle?.current_km || 0,
        maintenances: []
      }
    }
    acc[vehicleId].maintenances.push(sm)
    return acc
  }, {} as Record<string, any>)

  const scheduledDetails = Object.values(scheduledByVehicle).map((v: any) => {
    const vehicleInfo = `${v.plate} - ${v.model} (${v.currentKm.toLocaleString('pt-BR')} km)`
    const maintenancesList = v.maintenances
      .sort((a: any, b: any) => a.next_maintenance_km - b.next_maintenance_km)
      .map((m: any) => {
        const kmRemaining = m.next_maintenance_km - v.currentKm
        const status = kmRemaining <= 0 ? '[VENCIDA]' : kmRemaining <= 1000 ? '[PROXIMA]' : '[OK]'
        const kmInfo = kmRemaining <= 0 
          ? `há ${Math.abs(kmRemaining).toLocaleString('pt-BR')} km` 
          : `em ${kmRemaining.toLocaleString('pt-BR')} km`
        return `    - ${m.maintenance_name} (${m.interval_km.toLocaleString('pt-BR')} km): ${m.next_maintenance_km.toLocaleString('pt-BR')} km ${status} ${kmInfo}`
      })
      .join('\n')
    return `  ${vehicleInfo}\n${maintenancesList}`
  }).join('\n\n')

  // Manutenções vencidas detalhadas
  const overdueDetails = overdueScheduled.map(sm => {
    const vehicle = vehicles.find(v => v.id === sm.vehicle_id)
    const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado'
    const kmOverdue = (vehicle?.current_km || 0) - sm.next_maintenance_km
    return `• ${vehicleInfo}: ${sm.maintenance_name} - Vencida há ${kmOverdue.toLocaleString('pt-BR')} km`
  }).join('\n')

  // Próximas manutenções (urgentes)
  const upcomingDetails = upcomingScheduled.map(sm => {
    const vehicle = vehicles.find(v => v.id === sm.vehicle_id)
    const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado'
    const kmRemaining = sm.next_maintenance_km - (vehicle?.current_km || 0)
    return `• ${vehicleInfo}: ${sm.maintenance_name} - Faltam ${kmRemaining.toLocaleString('pt-BR')} km`
  }).join('\n')

  return `
RELATÓRIO DETALHADO DE MANUTENÇÕES

RESUMO EXECUTIVO:
Este relatório apresenta análise completa do histórico de manutenções realizadas, incluindo custos detalhados, estatísticas por veículo, itens utilizados e programação de manutenções preventivas.

1. DADOS GERAIS DO PERÍODO

Total de Manutenções Realizadas: ${total}
- Manutenções Preventivas: ${preventive} (${total > 0 ? ((preventive / total) * 100).toFixed(1) : 0}%)
- Manutenções Corretivas: ${corrective} (${total > 0 ? ((corrective / total) * 100).toFixed(1) : 0}%)
- Manutenções Preditivas: ${predictive} (${total > 0 ? ((predictive / total) * 100).toFixed(1) : 0}%)

Investimento Total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Custo Médio por Manutenção: R$ ${avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Manutenções com Custo Registrado: ${maintenances.filter(m => m.cost && m.cost > 0).length}

2. ANÁLISE DE CUSTOS POR TIPO

Manutenções Preventivas:
  Total: R$ ${costByType.preventiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Média: R$ ${preventive > 0 ? (costByType.preventiva / preventive).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
  Percentual do Total: ${totalCost > 0 ? ((costByType.preventiva / totalCost) * 100).toFixed(1) : 0}%

Manutenções Corretivas:
  Total: R$ ${costByType.corretiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Média: R$ ${corrective > 0 ? (costByType.corretiva / corrective).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
  Percentual do Total: ${totalCost > 0 ? ((costByType.corretiva / totalCost) * 100).toFixed(1) : 0}%

Manutenções Preditivas:
  Total: R$ ${costByType.preditiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  Média: R$ ${predictive > 0 ? (costByType.preditiva / predictive).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
  Percentual do Total: ${totalCost > 0 ? ((costByType.preditiva / totalCost) * 100).toFixed(1) : 0}%

3. ANÁLISE POR VEÍCULO (Top 10)

Veículos com Mais Manutenções:
${vehicleAnalysis || '• Nenhuma manutenção encontrada'}

4. MANUTENÇÕES MAIS CARAS (Top 10)

${topExpensive || '• Nenhuma manutenção registrada'}

5. ITENS E PEÇAS MAIS UTILIZADOS (Top 10)

${topItems || '• Nenhum item registrado'}

6. HISTÓRICO DETALHADO DAS MANUTENÇÕES (Últimas 20)

${detailedHistory || '• Nenhuma manutenção cadastrada'}

7. MANUTENÇÕES PROGRAMADAS (PREVENTIVAS)

Total de Manutenções Programadas Ativas: ${totalScheduled}
Manutenções Vencidas: ${overdueScheduled.length}
Manutenções Próximas do Vencimento (ate 1.000 km): ${upcomingScheduled.length}

${overdueScheduled.length > 0 ? `ATENÇÃO - MANUTENÇÕES VENCIDAS (${overdueScheduled.length}):\n${overdueDetails}\n` : '[OK] Nenhuma manutenção vencida\n'}
${upcomingScheduled.length > 0 ? `ALERTAS - MANUTENÇÕES PRÓXIMAS (${upcomingScheduled.length}):\n${upcomingDetails}\n` : '[OK] Nenhuma manutenção próxima do vencimento\n'}
${totalScheduled > 0 ? `PROGRAMAÇÃO COMPLETA POR VEÍCULO:\n${scheduledDetails}` : 'Nenhuma manutenção programada cadastrada'}

8. INDICADORES DE PERFORMANCE

Taxa de Manutenção Preventiva: ${total > 0 ? ((preventive / total) * 100).toFixed(1) : 0}%
  ${preventive / total >= 0.7 ? '[EXCELENTE] (≥70%)' : preventive / total >= 0.5 ? '[ADEQUADO] (50-69%)' : '[CRÍTICO] (<50%)'}

Relação Preventiva/Corretiva: ${corrective > 0 ? (preventive / corrective).toFixed(2) : 'N/A'}
  ${preventive / corrective >= 3 ? '[EXCELENTE] (≥3:1)' : preventive / corrective >= 1.5 ? '[ADEQUADO] (1.5-3:1)' : '[ATENÇÃO] (<1.5:1)'}

Custo Médio Preventiva vs Corretiva:
  Preventiva: R$ ${preventive > 0 ? (costByType.preventiva / preventive).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
  Corretiva: R$ ${corrective > 0 ? (costByType.corretiva / corrective).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
  ${corrective > 0 && preventive > 0 ? (costByType.corretiva / corrective > costByType.preventiva / preventive ? '[ALERTA] Corretivas são mais caras - Aumentar preventivas' : '[OK] Preventivas custam menos') : ''}

9. GLOSSÁRIO DE TIPOS DE MANUTENÇÃO

• PREVENTIVA: Manutenção programada para prevenir falhas e prolongar vida útil
• CORRETIVA: Manutenção para correção de falhas ou defeitos já ocorridos
• PREDITIVA: Manutenção baseada em análise de condição e previsão de falhas

OBSERVAÇÕES FINAIS:
Este relatório foi gerado automaticamente pelo Sistema de Gestão MAFFENG e reflete o histórico completo de manutenções cadastradas no período selecionado. Recomenda-se revisão periódica mensal deste relatório para acompanhamento de custos e planejamento estratégico.

Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
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
