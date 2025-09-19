# Guia de Migração: Firebase → Supabase

## 📋 Resumo da Migração

Este guia documenta a migração completa do Firebase Firestore para o Supabase PostgreSQL.

## 🔧 Configuração Inicial

### 1. Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta/projeto
3. Anote as credenciais:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` com:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Executar Schema SQL
1. Acesse o SQL Editor no Supabase
2. Execute o arquivo `scripts/supabase-schema.sql`
3. Verifique se todas as tabelas foram criadas

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `src/lib/supabase.ts` - Configuração do cliente Supabase
- `src/lib/supabase-services.ts` - Serviços para operações CRUD
- `src/hooks/use-supabase.ts` - Hooks customizados para Supabase
- `scripts/supabase-schema.sql` - Schema do banco de dados
- `scripts/migrate-firebase-to-supabase.js` - Script de migração

### Arquivos Modificados
- `src/hooks/index.ts` - Atualizado para usar hooks do Supabase
- `src/components/dashboard/alerts-panel.tsx` - Atualizado para novos tipos

### Arquivos Legacy (para remoção futura)
- `src/lib/firebase.ts` - Configuração Firebase (manter por enquanto)
- `src/lib/firestore.ts` - Serviços Firebase (manter por enquanto)
- `src/hooks/use-firestore.ts` - Hooks Firebase (manter por enquanto)

## 🔄 Principais Mudanças

### 1. Estrutura de Dados
- **Firebase**: camelCase (ex: `currentKm`, `nextMaintenance`)
- **Supabase**: snake_case (ex: `current_km`, `next_maintenance`)

### 2. Tipos de Dados
- **Firebase**: Timestamp objects
- **Supabase**: ISO strings

### 3. Queries
- **Firebase**: `collection().where().get()`
- **Supabase**: `.from().select().eq()`

## 🧪 Testando a Migração

### 1. Verificar Conexão
```typescript
import { supabase } from '@/lib/supabase'

// Testar conexão
const { data, error } = await supabase.from('employees').select('count')
console.log('Conexão:', error ? '❌' : '✅')
```

### 2. Testar CRUD Operations
```typescript
// Testar criação
const { data, error } = await supabase
  .from('employees')
  .insert({ name: 'Test', code: 'TEST001', ... })
  .select()

// Testar leitura
const { data } = await supabase
  .from('employees')
  .select('*')
```

## 🚀 Próximos Passos

### 1. Migrar Dados Existentes
- Use o script `migrate-firebase-to-supabase.js`
- Ajuste conforme seus dados específicos

### 2. Atualizar Todos os Componentes
- Verificar todos os componentes que usam dados
- Atualizar referências de campos (camelCase → snake_case)

### 3. Testes Completos
- Testar todas as funcionalidades
- Verificar performance
- Validar dados

### 4. Limpeza
- Remover arquivos Firebase após confirmação
- Remover dependências não utilizadas
- Atualizar documentação

## ⚠️ Pontos de Atenção

### 1. Autenticação
- Supabase usa sistema de autenticação diferente
- Pode precisar migrar usuários

### 2. Permissões (RLS)
- Row Level Security está habilitado
- Ajustar políticas conforme necessário

### 3. Performance
- PostgreSQL pode ter comportamento diferente
- Monitorar queries e otimizar se necessário

## 🔍 Troubleshooting

### Erro de Conexão
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Erro de Permissão
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'employees';
```

### Erro de Schema
```sql
-- Verificar se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 📞 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Migração](https://supabase.com/docs/guides/migrations)
- [Discord Supabase](https://discord.supabase.com)

---

**Status da Migração**: ✅ Concluída
**Data**: $(date)
**Versão**: 1.0
