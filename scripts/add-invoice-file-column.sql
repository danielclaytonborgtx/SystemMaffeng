-- Adicionar coluna invoice_file na tabela equipment
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE equipment 
ADD COLUMN invoice_file TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN equipment.invoice_file IS 'Nome do arquivo da nota fiscal anexada';

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipment' 
AND column_name = 'invoice_file';
