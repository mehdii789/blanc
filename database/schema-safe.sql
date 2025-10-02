-- Script SQL SÉCURISÉ pour créer les tables Supabase
-- Version avec IF NOT EXISTS pour éviter les conflits

-- Table des clients
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('gerant', 'operateur', 'comptoir', 'livreur')),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 0, -- en heures
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'inventaire
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  reorder_level DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente' 
    CHECK (status IN ('en_attente', 'en_traitement', 'lavage', 'sechage', 'pliage', 'pret', 'livre', 'annule')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')),
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services de commande (relation many-to-many)
CREATE TABLE IF NOT EXISTS order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des accès clients
CREATE TABLE IF NOT EXISTS client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  access_code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des packs de services
CREATE TABLE IF NOT EXISTS service_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  estimated_time INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  category VARCHAR(50) NOT NULL DEFAULT 'standard'
    CHECK (category IN ('standard', 'express', 'premium', 'literie', 'professionnel')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services dans les packs
CREATE TABLE IF NOT EXISTS pack_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES service_packs(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes clients
CREATE TABLE IF NOT EXISTS client_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_access_id UUID NOT NULL REFERENCES client_access(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente'
    CHECK (status IN ('en_attente', 'en_traitement', 'lavage', 'sechage', 'pliage', 'pret', 'livre', 'annule')),
  notes TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des packs dans les commandes clients
CREATE TABLE IF NOT EXISTS client_order_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_order_id UUID NOT NULL REFERENCES client_orders(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES service_packs(id) ON DELETE CASCADE,
  pack_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour optimiser les performances (seulement s'ils n'existent pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_customer_id') THEN
        CREATE INDEX idx_orders_customer_id ON orders(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
        CREATE INDEX idx_orders_status ON orders(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
        CREATE INDEX idx_orders_created_at ON orders(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_customer_id') THEN
        CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_order_id') THEN
        CREATE INDEX idx_invoices_order_id ON invoices(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_status') THEN
        CREATE INDEX idx_invoices_status ON invoices(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_access_customer_id') THEN
        CREATE INDEX idx_client_access_customer_id ON client_access(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_access_code') THEN
        CREATE INDEX idx_client_access_code ON client_access(access_code);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_orders_customer_id') THEN
        CREATE INDEX idx_client_orders_customer_id ON client_orders(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_items_quantity') THEN
        CREATE INDEX idx_inventory_items_quantity ON inventory_items(quantity);
    END IF;
END $$;

-- Fonctions pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (créer seulement s'ils n'existent pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at') THEN
        CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_items_updated_at') THEN
        CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_access_updated_at') THEN
        CREATE TRIGGER update_client_access_updated_at BEFORE UPDATE ON client_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_packs_updated_at') THEN
        CREATE TRIGGER update_service_packs_updated_at BEFORE UPDATE ON service_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_orders_updated_at') THEN
        CREATE TRIGGER update_client_orders_updated_at BEFORE UPDATE ON client_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Activer Row Level Security (RLS) seulement si pas déjà activé
DO $$ 
BEGIN
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE client_access ENABLE ROW LEVEL SECURITY;
    ALTER TABLE service_packs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pack_services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE client_order_packs ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorer les erreurs si RLS est déjà activé
        NULL;
END $$;

-- Politiques RLS (créer seulement si elles n'existent pas)
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON employees;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON services;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON inventory_items;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON orders;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON order_services;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON order_items;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON invoices;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON invoice_items;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON client_access;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_packs;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON pack_services;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON client_orders;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON client_order_packs;
    
    -- Créer les nouvelles politiques
    CREATE POLICY "Enable all operations for authenticated users" ON customers FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON employees FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON services FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON inventory_items FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON orders FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON order_services FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON order_items FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON invoices FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON invoice_items FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON client_access FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON service_packs FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON pack_services FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON client_orders FOR ALL USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON client_order_packs FOR ALL USING (true);
END $$;

-- Message de succès
SELECT 'Schéma de base de données créé avec succès ! Toutes les tables, index, triggers et politiques sont configurés.' as message;
