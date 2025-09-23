-- Criar bucket para armazenar notas fiscais dos equipamentos
-- Execute este SQL no SQL Editor do Supabase

-- Criar o bucket 'equipment-invoices' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-invoices',
  'equipment-invoices', 
  false, -- Não público
  10485760, -- 10MB limite
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'equipment-invoices';
