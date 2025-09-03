-- Criação das tabelas para gestão de colaboradores

-- Tabela de departamentos
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de colaboradores
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(20),
    email VARCHAR(200),
    address TEXT,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de equipamentos por colaborador (relaciona com equipment_movements)
CREATE TABLE IF NOT EXISTS employee_equipment_history (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    equipment_id INTEGER REFERENCES equipments(id),
    movement_id INTEGER REFERENCES equipment_movements(id),
    start_date DATE NOT NULL,
    end_date DATE,
    project VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Em Uso',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir departamentos padrão
INSERT INTO departments (name, description) VALUES
('Construção', 'Departamento de obras e construção civil'),
('Engenharia', 'Departamento de engenharia e projetos'),
('Supervisão', 'Departamento de supervisão e coordenação'),
('Administrativo', 'Departamento administrativo e financeiro'),
('Manutenção', 'Departamento de manutenção e reparos')
ON CONFLICT (name) DO NOTHING;

-- Inserir colaboradores de exemplo
INSERT INTO employees (name, code, position, department_id, phone, email, hire_date, status) VALUES
('João Silva', 'COL001', 'Operador de Máquinas', 1, '(11) 99999-1111', 'joao.silva@empresa.com', '2023-01-15', 'Ativo'),
('Maria Santos', 'COL002', 'Engenheira Civil', 2, '(11) 99999-2222', 'maria.santos@empresa.com', '2022-08-10', 'Ativo'),
('Carlos Oliveira', 'COL003', 'Soldador', 1, '(11) 99999-3333', 'carlos.oliveira@empresa.com', '2023-03-20', 'Férias'),
('Ana Costa', 'COL004', 'Supervisora', 3, '(11) 99999-4444', 'ana.costa@empresa.com', '2021-11-05', 'Ativo')
ON CONFLICT (code) DO NOTHING;

-- Inserir histórico de equipamentos (exemplo)
INSERT INTO employee_equipment_history (employee_id, equipment_id, start_date, end_date, project, status) VALUES
(1, 1, '2024-03-15', '2024-03-20', 'Obra Central', 'Devolvido'),
(1, 2, '2024-03-10', NULL, 'Obra Norte', 'Em Uso'),
(2, 3, '2024-02-28', '2024-03-05', 'Obra Central', 'Devolvido'),
(4, 1, '2024-01-15', NULL, 'Permanente', 'Em Uso')
ON CONFLICT DO NOTHING;
