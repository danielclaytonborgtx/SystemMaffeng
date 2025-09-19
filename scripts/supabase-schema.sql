-- Supabase Schema for SystemMaffeng
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'vacation', 'away', 'inactive')),
    phone VARCHAR(20),
    hire_date DATE,
    address TEXT,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    contracts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment table
CREATE TABLE equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance')),
    location VARCHAR(255) NOT NULL,
    assigned_to UUID REFERENCES employees(id),
    value DECIMAL(10,2),
    description TEXT,
    purchase_date DATE,
    supplier VARCHAR(255),
    invoice_number VARCHAR(100),
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plate VARCHAR(10) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    current_km INTEGER,
    maintenance_km INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'maintenance', 'retired')),
    fuel_type VARCHAR(50),
    chassis_number VARCHAR(50),
    renavam VARCHAR(20),
    color VARCHAR(50),
    engine_capacity VARCHAR(20),
    assigned_to UUID REFERENCES employees(id),
    purchase_date DATE,
    purchase_value DECIMAL(10,2),
    insurance_expiry DATE,
    license_expiry DATE,
    observations TEXT,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment_movements table
CREATE TABLE equipment_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    equipment_name VARCHAR(255) NOT NULL,
    equipment_code VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    employee_name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('out', 'return')),
    project VARCHAR(255) NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    observations TEXT,
    checklist JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle_maintenances table
CREATE TABLE vehicle_maintenances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    vehicle_plate VARCHAR(10) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('preventiva', 'corretiva', 'preditiva')),
    description TEXT NOT NULL,
    current_km INTEGER NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    items TEXT[] NOT NULL,
    next_maintenance_km INTEGER,
    observations TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle_fuels table
CREATE TABLE vehicle_fuels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    vehicle_plate VARCHAR(10) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    current_km INTEGER NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    consumption DECIMAL(5,2),
    station VARCHAR(255) NOT NULL,
    observations TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_code ON employees(code);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_equipment_code ON equipment(code);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_assigned_to ON equipment(assigned_to);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_assigned_to ON vehicles(assigned_to);
CREATE INDEX idx_equipment_movements_equipment_id ON equipment_movements(equipment_id);
CREATE INDEX idx_equipment_movements_employee_id ON equipment_movements(employee_id);
CREATE INDEX idx_vehicle_maintenances_vehicle_id ON vehicle_maintenances(vehicle_id);
CREATE INDEX idx_vehicle_fuels_vehicle_id ON vehicle_fuels(vehicle_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_movements_updated_at BEFORE UPDATE ON equipment_movements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_maintenances_updated_at BEFORE UPDATE ON vehicle_maintenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_fuels_updated_at BEFORE UPDATE ON vehicle_fuels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_fuels ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON equipment
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON vehicles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON equipment_movements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON vehicle_maintenances
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON vehicle_fuels
    FOR ALL USING (auth.role() = 'authenticated');
