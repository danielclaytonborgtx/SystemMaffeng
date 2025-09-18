const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Substitua pela sua configuração do Firebase
  });
}

const db = admin.firestore();

async function fixEquipmentResponsible() {
  try {
    console.log('🔍 Buscando equipamentos com dados inconsistentes...');
    
    // Buscar todos os equipamentos
    const equipmentSnapshot = await db.collection('equipment').get();
    
    let fixedCount = 0;
    const batch = db.batch();
    
    equipmentSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Verificar se o equipamento está disponível mas ainda tem responsável
      if (data.status === 'available' && data.assignedTo) {
        console.log(`⚠️  Equipamento inconsistente encontrado: ${data.name} (${data.code})`);
        console.log(`   Status: ${data.status}, Responsável: ${data.assignedTo}`);
        
        // Atualizar para remover o responsável
        const equipmentRef = db.collection('equipment').doc(doc.id);
        batch.update(equipmentRef, {
          assignedTo: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        fixedCount++;
        console.log(`✅ Marcado para correção: ${data.name} (${data.code})`);
      }
    });
    
    if (fixedCount > 0) {
      console.log(`\n🔄 Aplicando ${fixedCount} correções...`);
      await batch.commit();
      console.log(`✅ ${fixedCount} equipamento(s) corrigido(s) com sucesso!`);
    } else {
      console.log('✅ Nenhum equipamento com dados inconsistentes encontrado.');
    }
    
    // Mostrar estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    const finalSnapshot = await db.collection('equipment').get();
    let availableWithResponsible = 0;
    let availableWithoutResponsible = 0;
    let inUse = 0;
    
    finalSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'available') {
        if (data.assignedTo) {
          availableWithResponsible++;
        } else {
          availableWithoutResponsible++;
        }
      } else if (data.status === 'in_use') {
        inUse++;
      }
    });
    
    console.log(`   - Disponíveis sem responsável: ${availableWithoutResponsible}`);
    console.log(`   - Disponíveis com responsável: ${availableWithResponsible}`);
    console.log(`   - Em uso: ${inUse}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir equipamentos:', error);
  }
}

// Executar o script
fixEquipmentResponsible()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
