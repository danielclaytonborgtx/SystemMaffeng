# **Configuração do Firebase Firestore**

Este guia detalha os passos para configurar o Firebase Firestore e popular com dados de exemplo.

---

## **1. Configuração do Firestore no Firebase Console**

### **Passo 1: Criar o Banco de Dados**
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto "gestao-maffeng"
3. No menu lateral, clique em **"Firestore Database"**
4. Clique em **"Criar banco de dados"**
5. Escolha **"Começar no modo de teste"** (para desenvolvimento)
6. Selecione a localização mais próxima (ex: `southamerica-east1` para Brasil)

### **Passo 2: Configurar Regras de Segurança**
No Firestore, vá em **"Regras"** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## **2. População do Banco de Dados com Dados de Exemplo**

### **Passo 1: Obter o Arquivo de Credenciais do Firebase Admin SDK**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **"Configurações do Projeto"** (ícone de engrenagem)
4. Clique na aba **"Contas de Serviço"**
5. Clique em **"Gerar nova chave privada"** e depois em **"Gerar chave"**
6. Um arquivo JSON será baixado. **Renomeie-o para `serviceAccountKey.json`** e mova-o para a pasta `scripts/` do seu projeto

### **Passo 2: Instalar Dependências do Admin SDK**

No terminal, na raiz do projeto:

```bash
npm install firebase-admin
```

### **Passo 3: Executar o Script de População**

No terminal, na raiz do projeto:

```bash
node scripts/populate-firestore.js
```

Você verá mensagens no console indicando o progresso da população.

---

## **3. Estrutura das Coleções**

O sistema criará as seguintes coleções no Firestore:

### **`employees`** - Colaboradores
- `name`: Nome do colaborador
- `email`: Email
- `position`: Cargo
- `department`: Departamento
- `status`: Status (`active`, `vacation`, `away`)
- `hireDate`: Data de contratação
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### **`equipment`** - Equipamentos
- `name`: Nome do equipamento
- `category`: Categoria
- `status`: Status (`available`, `in_use`, `maintenance`, `retired`)
- `location`: Localização
- `lastMaintenance`: Última manutenção
- `nextMaintenance`: Próxima manutenção
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### **`vehicles`** - Veículos
- `plate`: Placa
- `model`: Modelo
- `brand`: Marca
- `year`: Ano
- `currentKm`: Quilometragem atual
- `maintenanceKm`: Quilometragem para manutenção
- `status`: Status (`active`, `maintenance`, `retired`)
- `fuelType`: Tipo de combustível
- `lastMaintenance`: Última manutenção
- `nextMaintenance`: Próxima manutenção
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

---

## **4. Verificação da Integração**

Após popular o banco de dados:

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Acesse o Dashboard** (`/dashboard`):
   - Os cards de estatísticas devem exibir os números reais do Firestore
   - Você deve ver loading states enquanto os dados carregam

3. **Acesse a página de Colaboradores** (`/dashboard/colaboradores`):
   - A lista deve exibir os colaboradores cadastrados no Firestore
   - Os filtros devem funcionar corretamente

---

## **5. Solução de Problemas**

### **"Permission denied" no Firestore**
- Verifique as regras de segurança do Firestore
- Certifique-se de que `allow read, write: if request.auth != null;` está configurado

### **Dados não aparecem**
- Verifique se o script `populate-firestore.js` foi executado sem erros
- Confira se as variáveis de ambiente do Firebase estão corretas
- Reinicie o servidor de desenvolvimento

### **Erro de importação de hooks**
- Certifique-se de que o arquivo `src/hooks/index.ts` existe e está exportando corretamente
- Reinicie o servidor de desenvolvimento

---

A integração com o Firebase Firestore está completa! 🎉