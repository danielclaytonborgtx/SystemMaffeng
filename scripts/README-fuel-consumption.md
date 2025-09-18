# Script de Atualização de Consumo de Combustível

Este script atualiza os registros de abastecimento existentes no Firestore para incluir o cálculo de consumo de combustível.

## O que foi corrigido

1. **Interface VehicleFuel**: Adicionado campo `consumption?: number` para armazenar o consumo em km/l
2. **Cálculo de Consumo**: Corrigida a lógica para calcular corretamente baseado no abastecimento anterior
3. **Persistência**: O consumo agora é calculado e salvo no banco de dados ao registrar novos abastecimentos
4. **Exibição**: O histórico agora mostra o consumo salvo no banco ou calcula dinamicamente se não existir

## Como usar o script

### 1. Configurar Firebase

Edite o arquivo `scripts/update-fuel-consumption.js` e adicione suas configurações do Firebase:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-project-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
}
```

### 2. Executar o script

```bash
cd scripts
node update-fuel-consumption.js
```

### 3. O que o script faz

- Busca todos os registros de abastecimento no Firestore
- Agrupa por veículo
- Ordena por data (mais antigo primeiro)
- Calcula o consumo para cada abastecimento baseado no anterior
- Atualiza o banco de dados com o campo `consumption`
- Ignora registros que já possuem consumo calculado

## Fórmula de Cálculo

```
Consumo (km/l) = Quilometragem Atual - Quilometragem Anterior / Litros Abastecidos
```

## Resultado Esperado

Após executar o script, os novos abastecimentos registrados através da interface terão o consumo calculado e salvo automaticamente. Os abastecimentos existentes serão atualizados com o consumo correto.

## Observações

- O primeiro abastecimento de cada veículo não terá consumo (pois não há referência anterior)
- O script é seguro e pode ser executado múltiplas vezes
- Registros que já possuem consumo são ignorados
