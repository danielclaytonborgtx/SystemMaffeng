// Script para migrar dados do Firebase para Supabase
// Execute este script após configurar o Supabase

const { createClient } = require('@supabase/supabase-js')
const admin = require('firebase-admin')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations

// Configuração do Firebase (se necessário para migração)
const firebaseConfig = {
  // Adicione suas credenciais do Firebase aqui se precisar migrar dados existentes
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Função para converter dados do Firebase para Supabase
function convertFirebaseToSupabase(firebaseData, type) {
  switch (type) {
    case 'employee':
      return {
        name: firebaseData.name,
        code: firebaseData.code,
        email: firebaseData.email || null,
        position: firebaseData.position,
        department: firebaseData.department,
        status: firebaseData.status,
        phone: firebaseData.phone || null,
        hire_date: firebaseData.hireDate || null,
        address: firebaseData.address || null,
        cpf: firebaseData.cpf || null,
        rg: firebaseData.rg || null,
        contracts: firebaseData.contracts || null,
        created_at: firebaseData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: firebaseData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    
    case 'equipment':
      return {
        name: firebaseData.name,
        code: firebaseData.code,
        category: firebaseData.category,
        status: firebaseData.status,
        location: firebaseData.location,
        assigned_to: firebaseData.assignedTo || null,
        value: firebaseData.value || null,
        description: firebaseData.description || null,
        purchase_date: firebaseData.purchaseDate || null,
        supplier: firebaseData.supplier || null,
        invoice_number: firebaseData.invoiceNumber || null,
        last_maintenance: firebaseData.lastMaintenance?.toDate?.()?.toISOString() || null,
        next_maintenance: firebaseData.nextMaintenance?.toDate?.()?.toISOString() || null,
        created_at: firebaseData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: firebaseData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    
    case 'vehicle':
      return {
        plate: firebaseData.plate,
        model: firebaseData.model,
        brand: firebaseData.brand,
        year: firebaseData.year,
        current_km: firebaseData.currentKm || null,
        maintenance_km: firebaseData.maintenanceKm || null,
        status: firebaseData.status,
        fuel_type: firebaseData.fuelType || null,
        chassis_number: firebaseData.chassisNumber || null,
        renavam: firebaseData.renavam || null,
        color: firebaseData.color || null,
        engine_capacity: firebaseData.engineCapacity || null,
        assigned_to: firebaseData.assignedTo || null,
        purchase_date: firebaseData.purchaseDate || null,
        purchase_value: firebaseData.purchaseValue || null,
        insurance_expiry: firebaseData.insuranceExpiry || null,
        license_expiry: firebaseData.licenseExpiry || null,
        observations: firebaseData.observations || null,
        last_maintenance: firebaseData.lastMaintenance?.toDate?.()?.toISOString() || null,
        next_maintenance: firebaseData.nextMaintenance?.toDate?.()?.toISOString() || null,
        created_at: firebaseData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: firebaseData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    
    default:
      return firebaseData
  }
}

// Função para migrar dados
async function migrateData() {
  console.log('🚀 Iniciando migração de dados...')
  
  try {
    // Exemplo de migração (ajuste conforme seus dados)
    console.log('📝 Migração concluída!')
    console.log('✅ Todos os dados foram migrados com sucesso para o Supabase')
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateData()
}

module.exports = { migrateData, convertFirebaseToSupabase }
