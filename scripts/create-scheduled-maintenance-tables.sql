-- Create scheduled maintenance tables
-- Execute this in your Supabase SQL Editor

-- Create vehicle_scheduled_maintenances table
CREATE TABLE vehicle_scheduled_maintenances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    maintenance_name VARCHAR(255) NOT NULL,
    interval_km INTEGER NOT NULL,
    next_maintenance_km INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicle_scheduled_maintenances_vehicle_id ON vehicle_scheduled_maintenances(vehicle_id);
CREATE INDEX idx_vehicle_scheduled_maintenances_is_active ON vehicle_scheduled_maintenances(is_active);

-- Create updated_at trigger
CREATE TRIGGER update_vehicle_scheduled_maintenances_updated_at BEFORE UPDATE ON vehicle_scheduled_maintenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE vehicle_scheduled_maintenances ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all operations for authenticated users" ON vehicle_scheduled_maintenances
    FOR ALL USING (auth.role() = 'authenticated');
