-- Criação das tabelas para gestão de veículos e manutenções

-- Tabela de tipos de veículos
CREATE TABLE IF NOT EXISTS vehicle_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(200) NOT NULL,
    type_id INTEGER REFERENCES vehicle_types(id),
    year INTEGER,
    current_km INTEGER DEFAULT 0,
    chassis_number VARCHAR(100),
    renavam VARCHAR(50),
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    engine_capacity VARCHAR(20),
    assigned_to VARCHAR(200),
    status VARCHAR(50) DEFAULT 'Ativo',
    purchase_date DATE,
    purchase_value DECIMAL(12,2),
    insurance_expiry DATE,
    license_expiry DATE,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de manutenção
CREATE TABLE IF NOT EXISTS maintenance_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_interval_km INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de manutenções
CREATE TABLE IF NOT EXISTS vehicle_maintenances (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    maintenance_type_id INTEGER REFERENCES maintenance_types(id),
    date DATE NOT NULL,
    km INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Preventiva', 'Corretiva', 'Preditiva'
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    items_replaced TEXT,
    next_maintenance_km INTEGER,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de abastecimentos
CREATE TABLE IF NOT EXISTS fuel_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    date DATE NOT NULL,
    km INTEGER NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    station VARCHAR(200),
    consumption DECIMAL(5,2), -- km/l calculado
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de programação de manutenções preventivas
CREATE TABLE IF NOT EXISTS scheduled_maintenances (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    maintenance_type_id INTEGER REFERENCES maintenance_types(id),
    interval_km INTEGER NOT NULL,
    next_maintenance_km INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de veículos padrão
INSERT INTO vehicle_types (name, description) VALUES
('Caminhão', 'Veículos de carga pesada'),
('Caminhonete', 'Veículos de carga leve'),
('Escavadeira', 'Máquinas escavadoras'),
('Trator', 'Tratores e máquinas agrícolas'),
('Betoneira', 'Caminhões betoneira'),
('Guindaste', 'Guindastes e equipamentos de elevação')
ON CONFLICT (name) DO NOTHING;

-- Inserir tipos de manutenção padrão
INSERT INTO maintenance_types (name, description, default_interval_km) VALUES
('Troca de Óleo', 'Troca de óleo do motor e filtros', 5000),
('Troca de Filtros', 'Troca de filtros de ar, combustível e óleo', 10000),
('Rodízio de Pneus', 'Rodízio e verificação de pneus', 20000),
('Revisão de Freios', 'Verificação e manutenção do sistema de freios', 15000),
('Troca de Correia Dentada', 'Substituição da correia dentada', 60000),
('Revisão Geral', 'Revisão completa do veículo', 10000)
ON CONFLICT (name) DO NOTHING;

-- Inserir veículos de exemplo
INSERT INTO vehicles (plate, model, type_id, year, current_km, fuel_type, assigned_to, status) VALUES
('ABC-1234', 'Volvo FH 540', 1, 2022, 45000, 'Diesel', 'João Silva', 'Ativo'),
('XYZ-5678', 'Caterpillar 320D', 3, 2021, 2800, 'Diesel', NULL, 'Manutenção'),
('DEF-9012', 'Ford Ranger XLT', 2, 2023, 12000, 'Diesel', 'Maria Santos', 'Ativo')
ON CONFLICT (plate) DO NOTHING;

-- Inserir manutenções de exemplo
INSERT INTO vehicle_maintenances (vehicle_id, maintenance_type_id, date, km, type, description, cost, next_maintenance_km) VALUES
(1, 1, '2024-02-15', 42000, 'Preventiva', 'Troca de óleo e filtros', 350.00, 47000),
(1, 3, '2024-01-10', 40000, 'Corretiva', 'Troca de pneus dianteiros', 1200.00, NULL),
(3, 1, '2024-03-01', 11500, 'Preventiva', 'Troca de óleo', 180.00, 16500)
ON CONFLICT DO NOTHING;

-- Inserir abastecimentos de exemplo
INSERT INTO fuel_records (vehicle_id, date, km, liters, cost, price_per_liter, station, consumption) VALUES
(1, '2024-03-15', 45000, 120.00, 720.00, 6.000, 'Posto Shell Centro', 8.5),
(1, '2024-03-10', 44000, 115.00, 690.00, 6.000, 'Posto BR Norte', 8.7),
(3, '2024-03-12', 12000, 45.00, 270.00, 6.000, 'Posto Ipiranga Sul', 12.2)
ON CONFLICT DO NOTHING;
