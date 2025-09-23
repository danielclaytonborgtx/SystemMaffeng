-- Configurar políticas de segurança para o bucket equipment-invoices
-- Execute este SQL no SQL Editor do Supabase

-- 1. Habilitar RLS no bucket (se não estiver habilitado)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir INSERT (upload) de arquivos
CREATE POLICY "Allow authenticated users to upload invoice files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'equipment-invoices');

-- 3. Criar política para permitir SELECT (download) de arquivos
CREATE POLICY "Allow authenticated users to download invoice files" ON storage.objects
FOR SELECT 
TO authenticated
USING (bucket_id = 'equipment-invoices');

-- 4. Criar política para permitir UPDATE (atualizar) de arquivos
CREATE POLICY "Allow authenticated users to update invoice files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'equipment-invoices')
WITH CHECK (bucket_id = 'equipment-invoices');

-- 5. Criar política para permitir DELETE (remover) de arquivos
CREATE POLICY "Allow authenticated users to delete invoice files" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'equipment-invoices');

-- 6. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%invoice%';
