# Configuração do Firebase

## 1. Configuração no Console do Firebase

### Passos já realizados:
- ✅ Projeto criado: `gestao-maffeng`
- ✅ Configurações básicas obtidas

### Próximos passos necessários:

#### 1.1. Habilitar Authentication
1. No console do Firebase, vá para **Authentication**
2. Clique em **Get started**
3. Na aba **Sign-in method**, habilite:
   - **Email/Password**
   - **Google** (opcional)

#### 1.2. Configurar Firestore Database
1. No console do Firebase, vá para **Firestore Database**
2. Clique em **Create database**
3. Escolha **Start in test mode** (para desenvolvimento)
4. Escolha uma localização (recomendado: `southamerica-east1` para Brasil)

#### 1.3. Obter App ID
1. No console do Firebase, vá para **Project Settings** (ícone da engrenagem)
2. Na seção **Your apps**, clique em **Add app** se não houver nenhuma
3. Escolha **Web** (ícone `</>`)
4. Registre o app com o nome: `gestao-maffeng-web`
5. Copie o **App ID** e substitua `your-app-id-here` no arquivo `src/lib/firebase.ts`

## 2. Configuração no Projeto

### 2.1. Variáveis de Ambiente (Opcional)
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCK7yqjC4DDdJyyiLX-1imM4Xz4SoGLZSk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gestao-maffeng.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gestao-maffeng
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gestao-maffeng.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=529134422664
NEXT_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID_AQUI
```

### 2.2. Estrutura do Firestore
O sistema criará automaticamente as seguintes coleções:

- **employees**: Colaboradores
- **equipment**: Equipamentos  
- **vehicles**: Veículos

## 3. Funcionalidades Implementadas

### 3.1. Autenticação
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Logout
- ✅ Persistência de sessão

### 3.2. Firestore Services
- ✅ CRUD para Colaboradores
- ✅ CRUD para Equipamentos
- ✅ CRUD para Veículos
- ✅ Tipos TypeScript definidos

## 4. Como Usar

### 4.1. Login
```typescript
const { login } = useAuth()
const success = await login('email@exemplo.com', 'senha123')
```

### 4.2. Registro
```typescript
const { register } = useAuth()
const success = await register('email@exemplo.com', 'senha123', 'Nome do Usuário')
```

### 4.3. Usar Firestore
```typescript
import { employeeService } from '@/lib/firestore'

// Buscar todos os colaboradores
const employees = await employeeService.getAll()

// Criar novo colaborador
const newEmployee = await employeeService.create({
  name: 'João Silva',
  email: 'joao@exemplo.com',
  position: 'Engenheiro',
  department: 'Construção',
  status: 'active'
})
```

## 5. Próximos Passos

1. **Habilitar Authentication no console**
2. **Criar Firestore Database**
3. **Obter App ID e atualizar configuração**
4. **Testar login/registro**
5. **Implementar integração com as páginas existentes**

## 6. Segurança

⚠️ **Importante**: 
- Configure as regras do Firestore adequadamente para produção
- Use variáveis de ambiente para as configurações sensíveis
- Implemente validação de dados no frontend e backend
