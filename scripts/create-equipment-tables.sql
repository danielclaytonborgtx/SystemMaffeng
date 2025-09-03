-- Criação das tabelas para gestão de equipamentos

-- Tabela de tipos de equipamentos
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type_id INTEGER REFERENCES equipment_types(id),
    description TEXT,
    purchase_value DECIMAL(10,2),
    purchase_date DATE,
    supplier VARCHAR(200),
    invoice_number VARCHAR(100),
    current_location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Disponível',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de equipamentos
CREATE TABLE IF NOT EXISTS equipment_movements (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id),
    employee_id VARCHAR(50),
    employee_name VARCHAR(200),
    movement_type VARCHAR(20) NOT NULL, -- 'saida' ou 'devolucao'
    project VARCHAR(100),
    expected_return_date DATE,
    actual_return_date DATE,
    observations TEXT,
    checklist_data JSONB, -- Para armazenar dados do checklist de devolução
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de equipamentos padrão
INSERT INTO equipment_types (name, description) VALUES
('Ferramenta Elétrica', 'Ferramentas que utilizam energia elétrica'),
('Ferramenta Pneumática', 'Ferramentas que utilizam ar comprimido'),
('Equipamento de Segurança', 'EPIs e equipamentos de proteção'),
('Máquina Pesada', 'Equipamentos de grande porte'),
('Mobiliário', 'Móveis e equipamentos de escritório')
ON CONFLICT (name) DO NOTHING;

-- Inserir equipamentos de exemplo
INSERT INTO equipments (name, code, type_id, description, purchase_value, purchase_date, supplier, current_location, status) VALUES
('Furadeira Bosch GSB 550', 'EQ001', 1, 'Furadeira de impacto com velocidade variável', 299.99, '2024-01-15', 'Bosch do Brasil', 'Almoxarifado A', 'Disponível'),
('Martelo Pneumático Makita', 'EQ002', 2, 'Martelo pneumático para demolição', 1299.99, '2024-02-10', 'Makita Brasil', 'Obra Central', 'Em Uso'),
('Serra Circular Dewalt', 'EQ003', 1, 'Serra circular 7 1/4 polegadas', 599.99, '2024-01-20', 'Dewalt Brasil', 'Oficina', 'Manutenção')
ON CONFLICT (code) DO NOTHING;
