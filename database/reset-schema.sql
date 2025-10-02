-- Script de réinitialisation de la base de données Supabase
-- À exécuter AVANT le schema.sql principal

-- Désactiver les contraintes de clés étrangères temporairement
SET session_replication_role = replica;

-- Supprimer toutes les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS client_order_packs CASCADE;
DROP TABLE IF EXISTS client_orders CASCADE;
DROP TABLE IF EXISTS pack_services CASCADE;
DROP TABLE IF EXISTS service_packs CASCADE;
DROP TABLE IF EXISTS client_access CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS order_services CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Supprimer les fonctions et triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Message de confirmation
SELECT 'Base de données réinitialisée avec succès. Vous pouvez maintenant exécuter schema.sql' as message;
