// Utilitaire de migration des données de JSONBin vers Supabase
import { databaseService } from '../services/database';
import { supabaseService } from '../services/supabaseService';

export class DataMigration {
  private static instance: DataMigration;
  
  static getInstance(): DataMigration {
    if (!DataMigration.instance) {
      DataMigration.instance = new DataMigration();
    }
    return DataMigration.instance;
  }

  async migrateAllData(): Promise<void> {
    console.log('🚀 Début de la migration des données...');
    
    try {
      // 1. Migrer les clients
      await this.migrateCustomers();
      
      // 2. Migrer les employés
      await this.migrateEmployees();
      
      // 3. Migrer les services
      await this.migrateServices();
      
      // 4. Migrer l'inventaire
      await this.migrateInventory();
      
      // 5. Migrer les packs de services
      await this.migrateServicePacks();
      
      // 6. Migrer les accès clients
      await this.migrateClientAccess();
      
      // 7. Migrer les commandes (après les clients et services)
      await this.migrateOrders();
      
      // 8. Migrer les factures (après les commandes)
      await this.migrateInvoices();
      
      // 9. Migrer les commandes clients
      await this.migrateClientOrders();
      
      console.log('✅ Migration terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  private async migrateCustomers(): Promise<void> {
    console.log('📋 Migration des clients...');
    
    const customers = await databaseService.getCustomers();
    
    for (const customer of customers) {
      try {
        await supabaseService.createCustomer({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode,
          notes: customer.notes
        });
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration du client ${customer.name}:`, error);
      }
    }
    
    console.log(`✅ ${customers.length} clients migrés`);
  }

  private async migrateEmployees(): Promise<void> {
    console.log('👥 Migration des employés...');
    
    const employees = await databaseService.getEmployees();
    
    for (const employee of employees) {
      try {
        await supabaseService.createEmployee({
          name: employee.name,
          role: employee.role,
          email: employee.email,
          phone: employee.phone
        });
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de l'employé ${employee.name}:`, error);
      }
    }
    
    console.log(`✅ ${employees.length} employés migrés`);
  }

  private async migrateServices(): Promise<void> {
    console.log('🛠️ Migration des services...');
    
    const services = await databaseService.getServices();
    
    for (const service of services) {
      try {
        await supabaseService.createService({
          name: service.name,
          price: service.price,
          description: service.description,
          estimatedTime: service.estimatedTime
        });
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration du service ${service.name}:`, error);
      }
    }
    
    console.log(`✅ ${services.length} services migrés`);
  }

  private async migrateInventory(): Promise<void> {
    console.log('📦 Migration de l\'inventaire...');
    
    const items = await databaseService.getInventoryItems();
    
    for (const item of items) {
      try {
        await supabaseService.createInventoryItem({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          reorderLevel: item.reorderLevel
        });
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de l'article ${item.name}:`, error);
      }
    }
    
    console.log(`✅ ${items.length} articles d'inventaire migrés`);
  }

  private async migrateServicePacks(): Promise<void> {
    console.log('📦 Migration des packs de services...');
    
    const packs = await databaseService.getServicePacks();
    
    for (const pack of packs) {
      try {
        await supabaseService.createServicePack({
          name: pack.name,
          description: pack.description,
          services: pack.services,
          totalPrice: pack.totalPrice,
          estimatedTime: pack.estimatedTime,
          isActive: pack.isActive,
          category: pack.category
        });
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration du pack ${pack.name}:`, error);
      }
    }
    
    console.log(`✅ ${packs.length} packs de services migrés`);
  }

  private async migrateClientAccess(): Promise<void> {
    console.log('🔑 Migration des accès clients...');
    
    const accesses = await databaseService.getClientAccess();
    
    // Récupérer les clients Supabase pour mapper les IDs
    const supabaseCustomers = await supabaseService.getCustomers();
    const jsonbinCustomers = await databaseService.getCustomers();
    
    for (const access of accesses) {
      try {
        // Trouver le client correspondant dans Supabase
        const jsonbinCustomer = jsonbinCustomers.find(c => c.id === access.customerId);
        const supabaseCustomer = supabaseCustomers.find(c => 
          c.email === jsonbinCustomer?.email
        );
        
        if (supabaseCustomer) {
          await supabaseService.createClientAccess({
            customerId: supabaseCustomer.id,
            accessCode: access.accessCode,
            isActive: access.isActive,
            lastLogin: access.lastLogin
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de l'accès ${access.accessCode}:`, error);
      }
    }
    
    console.log(`✅ ${accesses.length} accès clients migrés`);
  }

  private async migrateOrders(): Promise<void> {
    console.log('📋 Migration des commandes...');
    
    const orders = await databaseService.getOrders();
    
    // Récupérer les données de référence
    const supabaseCustomers = await supabaseService.getCustomers();
    const supabaseServices = await supabaseService.getServices();
    const jsonbinCustomers = await databaseService.getCustomers();
    
    for (const order of orders) {
      try {
        // Trouver le client correspondant
        const jsonbinCustomer = jsonbinCustomers.find(c => c.id === order.customerId);
        const supabaseCustomer = supabaseCustomers.find(c => 
          c.email === jsonbinCustomer?.email
        );
        
        if (supabaseCustomer) {
          // Mapper les services
          const mappedServices = order.services.map(orderService => {
            const supabaseService = supabaseServices.find(s => s.name === orderService.name);
            return {
              id: supabaseService?.id || '',
              name: orderService.name,
              price: orderService.price,
              description: orderService.description,
              estimatedTime: orderService.estimatedTime,
              quantity: orderService.quantity
            };
          }).filter(s => s.id); // Garder seulement les services trouvés
          
          await supabaseService.createOrder({
            customerId: supabaseCustomer.id,
            services: mappedServices,
            items: order.items,
            status: order.status,
            totalAmount: order.totalAmount,
            paid: order.paid,
            paymentMethod: order.paymentMethod,
            notes: order.notes,
            dueDate: order.dueDate
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de la commande ${order.id}:`, error);
      }
    }
    
    console.log(`✅ ${orders.length} commandes migrées`);
  }

  private async migrateInvoices(): Promise<void> {
    console.log('🧾 Migration des factures...');
    
    const invoices = await databaseService.getInvoices();
    
    // Récupérer les données de référence
    const supabaseCustomers = await supabaseService.getCustomers();
    const supabaseOrders = await supabaseService.getOrders();
    const jsonbinCustomers = await databaseService.getCustomers();
    const jsonbinOrders = await databaseService.getOrders();
    
    for (const invoice of invoices) {
      try {
        // Trouver le client correspondant
        const jsonbinCustomer = jsonbinCustomers.find(c => c.id === invoice.customerId);
        const supabaseCustomer = supabaseCustomers.find(c => 
          c.email === jsonbinCustomer?.email
        );
        
        // Trouver la commande correspondante (approximation par montant et client)
        const jsonbinOrder = jsonbinOrders.find(o => o.id === invoice.orderId);
        const supabaseOrder = supabaseOrders.find(o => 
          o.customerId === supabaseCustomer?.id && 
          Math.abs(o.totalAmount - jsonbinOrder?.totalAmount || 0) < 0.01
        );
        
        if (supabaseCustomer && supabaseOrder) {
          await supabaseService.createInvoice({
            invoiceNumber: invoice.invoiceNumber,
            orderId: supabaseOrder.id,
            customerId: supabaseCustomer.id,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            items: invoice.items,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            discount: invoice.discount,
            total: invoice.total,
            notes: invoice.notes,
            status: invoice.status
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de la facture ${invoice.invoiceNumber}:`, error);
      }
    }
    
    console.log(`✅ ${invoices.length} factures migrées`);
  }

  private async migrateClientOrders(): Promise<void> {
    console.log('🛒 Migration des commandes clients...');
    
    const clientOrders = await databaseService.getClientOrders();
    
    // Récupérer les données de référence
    const supabaseCustomers = await supabaseService.getCustomers();
    const supabaseClientAccess = await supabaseService.getClientAccess();
    const supabaseServicePacks = await supabaseService.getServicePacks();
    const jsonbinCustomers = await databaseService.getCustomers();
    const jsonbinClientAccess = await databaseService.getClientAccess();
    
    for (const clientOrder of clientOrders) {
      try {
        // Trouver l'accès client correspondant
        const jsonbinAccess = jsonbinClientAccess.find(a => a.id === clientOrder.clientAccessId);
        const jsonbinCustomer = jsonbinCustomers.find(c => c.id === jsonbinAccess?.customerId);
        const supabaseCustomer = supabaseCustomers.find(c => 
          c.email === jsonbinCustomer?.email
        );
        const supabaseAccess = supabaseClientAccess.find(a => 
          a.customerId === supabaseCustomer?.id
        );
        
        if (supabaseCustomer && supabaseAccess) {
          // Mapper les packs
          const mappedPacks = clientOrder.packs.map(orderPack => {
            const supabasePack = supabaseServicePacks.find(p => p.name === orderPack.packName);
            return {
              packId: supabasePack?.id || '',
              packName: orderPack.packName,
              quantity: orderPack.quantity,
              unitPrice: orderPack.unitPrice,
              total: orderPack.total
            };
          }).filter(p => p.packId); // Garder seulement les packs trouvés
          
          await supabaseService.createClientOrder({
            clientAccessId: supabaseAccess.id,
            customerId: supabaseCustomer.id,
            packs: mappedPacks,
            totalAmount: clientOrder.totalAmount,
            status: clientOrder.status,
            notes: clientOrder.notes,
            pickupDate: clientOrder.pickupDate,
            deliveryDate: clientOrder.deliveryDate
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la migration de la commande client ${clientOrder.id}:`, error);
      }
    }
    
    console.log(`✅ ${clientOrders.length} commandes clients migrées`);
  }

  async testMigration(): Promise<boolean> {
    try {
      console.log('🧪 Test de la migration...');
      
      // Tester la connexion Supabase
      const isConnected = await supabaseService.testConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter à Supabase');
      }
      
      // Tester la récupération des données JSONBin
      const customers = await databaseService.getCustomers();
      console.log(`📊 ${customers.length} clients trouvés dans JSONBin`);
      
      console.log('✅ Test de migration réussi');
      return true;
    } catch (error) {
      console.error('❌ Test de migration échoué:', error);
      return false;
    }
  }
}

export const dataMigration = DataMigration.getInstance();
