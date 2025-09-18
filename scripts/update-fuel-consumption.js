const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, updateDoc, doc, orderBy, query, where } = require('firebase/firestore')

// Configuração do Firebase (ajuste conforme necessário)
const firebaseConfig = {
  // Cole aqui suas configurações do Firebase
  apiKey: "sua-api-key",
  authDomain: "seu-auth-domain",
  projectId: "seu-project-id",
  storageBucket: "seu-storage-bucket",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function updateFuelConsumption() {
  try {
    console.log('🔍 Buscando registros de abastecimento...')
    
    // Buscar todos os abastecimentos
    const fuelsRef = collection(db, 'vehicleFuels')
    const querySnapshot = await getDocs(fuelsRef)
    
    console.log(`📊 Encontrados ${querySnapshot.docs.length} registros de abastecimento`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    // Agrupar por veículo para calcular consumo corretamente
    const vehiclesData = {}
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      const vehicleId = data.vehicleId
      
      if (!vehiclesData[vehicleId]) {
        vehiclesData[vehicleId] = []
      }
      
      vehiclesData[vehicleId].push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || 0
      })
    })
    
    // Para cada veículo, ordenar por data e calcular consumo
    for (const vehicleId in vehiclesData) {
      const vehicleFuels = vehiclesData[vehicleId]
      
      // Ordenar por data (mais antigo primeiro)
      vehicleFuels.sort((a, b) => a.createdAt - b.createdAt)
      
      console.log(`🚗 Processando veículo ${vehicleId} com ${vehicleFuels.length} abastecimentos`)
      
      // Calcular consumo para cada abastecimento (exceto o primeiro)
      for (let i = 1; i < vehicleFuels.length; i++) {
        const currentFuel = vehicleFuels[i]
        const previousFuel = vehicleFuels[i - 1]
        
        // Verificar se já tem consumo calculado
        if (currentFuel.consumption !== undefined) {
          skippedCount++
          continue
        }
        
        const kmTraveled = currentFuel.currentKm - previousFuel.currentKm
        let consumption = 0
        
        if (kmTraveled > 0 && currentFuel.liters > 0) {
          consumption = kmTraveled / currentFuel.liters
        }
        
        // Atualizar no banco de dados
        const docRef = doc(db, 'vehicleFuels', currentFuel.id)
        await updateDoc(docRef, {
          consumption: consumption > 0 ? consumption : null
        })
        
        console.log(`  ✅ Abastecimento ${currentFuel.id}: ${consumption.toFixed(2)} km/l`)
        updatedCount++
      }
    }
    
    console.log(`\n🎉 Atualização concluída!`)
    console.log(`📈 Registros atualizados: ${updatedCount}`)
    console.log(`⏭️  Registros ignorados: ${skippedCount}`)
    
  } catch (error) {
    console.error('❌ Erro ao atualizar consumo de combustível:', error)
  }
}

// Executar script
updateFuelConsumption()
  .then(() => {
    console.log('✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução do script:', error)
    process.exit(1)
  })
