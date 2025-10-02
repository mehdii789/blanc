# 🔗 Système de Mapping Service-Inventaire

## Vue d'ensemble

Votre application de blanchisserie dispose maintenant d'un système complet de liaison entre les **services** et les **produits d'inventaire**. Ce système permet de :

- ✅ **Assigner automatiquement** des produits d'inventaire à chaque service
- ✅ **Calculer la consommation** en temps réel selon les quantités de service
- ✅ **Vérifier la disponibilité** avant de créer une commande
- ✅ **Synchroniser l'inventaire** selon le statut des commandes
- ✅ **Afficher des alertes** en cas de stock insuffisant

---

## 🎯 Fonctionnalités Implémentées

### 1. **Page de Configuration des Services** (`/service-configuration`)

**Accès :** Sidebar → "Config Services" 

**Fonctionnalités :**
- **Simulateur interactif** : Testez l'impact de différentes combinaisons de services
- **Gestionnaire de mappings** : Configurez quels produits sont consommés par chaque service
- **Statistiques en temps réel** : Nombre de services, produits, alertes de stock
- **Guide d'utilisation** intégré

### 2. **Mappings Service → Inventaire**

Chaque service peut consommer plusieurs produits d'inventaire :

| Service | Produits Consommés |
|---------|-------------------|
| **Lavage & Pliage** | Lessive Standard (0.1L/kg) + Adoucissant (0.05L/kg) + Sacs (1/commande) |
| **Nettoyage à sec** | Détachant (0.2 bouteille/pièce) + Sacs (1/commande) |
| **Lavage Express** | Lessive Standard (0.15L/kg) + Adoucissant (0.08L/kg) + Sacs (1/commande) |
| **Literie** | Lessive Écologique (0.3L/pièce) + Adoucissant (0.2L/pièce) + Eau de Javel (0.1L/pièce) + Sacs (1/commande) |
| **Repassage** | Feuilles Assouplissantes (2 feuilles/pièce) |

### 3. **Synchronisation Automatique**

**Statuts consommateurs :** `en_traitement`, `lavage`, `sechage`, `pliage`, `pret`, `livre`
**Statuts non-consommateurs :** `en_attente`, `annule`

**Logique :**
1. **Création de commande** → Vérification inventaire → Consommation si statut consommateur
2. **Changement de statut** → Calcul différentiel → Mise à jour inventaire
3. **Suppression/Annulation** → Restauration de l'inventaire consommé

### 4. **Interface Utilisateur Améliorée**

**Dans le formulaire de commande :**
- Affichage en temps réel de l'impact sur l'inventaire
- Alertes visuelles (rouge/vert) selon la disponibilité
- Blocage de création si stock insuffisant

**Dans la page d'inventaire :**
- Alertes de stock faible intégrées
- Calcul de l'inventaire théorique

---

## 🛠️ Comment Utiliser le Système

### **Étape 1 : Configurer les Mappings**

1. Allez dans **Config Services** (`/service-configuration`)
2. Utilisez le **simulateur** pour tester différentes combinaisons
3. Cliquez sur **"Modifier"** pour un service
4. **Ajoutez des produits** avec "Ajouter un produit"
5. **Définissez les quantités** consommées par unité de service
6. **Supprimez** des produits avec l'icône poubelle

### **Étape 2 : Créer une Commande**

1. Allez dans **Commandes** → "Nouvelle commande"
2. Sélectionnez un client et des services
3. **Observez l'impact inventaire** en temps réel
4. L'application vous **bloque** si le stock est insuffisant
5. **Validez** la commande si tout est OK

### **Étape 3 : Suivre l'Inventaire**

1. Allez dans **Inventaire**
2. Voyez les **alertes de stock faible** en haut
3. L'inventaire se **met à jour automatiquement** selon les commandes
4. **Réapprovisionnez** quand nécessaire

---

## 🔧 Architecture Technique

### **Fichiers Clés**

```
src/
├── utils/inventorySync.ts           # Logique de synchronisation
├── components/services/
│   ├── ServiceInventoryManager.tsx  # Interface de configuration
│   ├── ServiceInventoryImpact.tsx   # Affichage d'impact
│   └── ServiceInventoryDemo.tsx     # Simulateur interactif
├── pages/ServiceConfigurationPage.tsx
└── components/orders/OrderForm.tsx  # Intégration dans commandes
```

### **Fonctions Utilitaires**

```typescript
// Calculer la consommation d'une commande
calculateInventoryConsumption(order: Order): { itemId: string; quantity: number }[]

// Vérifier la disponibilité
checkInventoryAvailability(order: Order, inventory: InventoryItem[]): { available: boolean; shortages: [...] }

// Appliquer la consommation
applyInventoryConsumption(order: Order, inventory: InventoryItem[]): InventoryItem[]

// Restaurer l'inventaire
restoreInventoryConsumption(order: Order, inventory: InventoryItem[]): InventoryItem[]

// Articles en stock faible
getLowStockItems(inventory: InventoryItem[]): InventoryItem[]
```

### **Types de Données**

```typescript
interface ServiceInventoryMapping {
  serviceId: string;
  serviceName: string;
  inventoryRequirements: {
    itemId: string;
    quantityPerUnit: number; // Quantité par unité de service
  }[];
}
```

---

## 🎨 Interface Utilisateur

### **Codes Couleur**
- 🟢 **Vert** : Stock suffisant
- 🔴 **Rouge** : Stock insuffisant / Rupture critique
- 🟡 **Ambre** : Stock faible (proche du seuil de réapprovisionnement)
- 🔵 **Bleu** : Service sélectionné / Configuration active

### **Icônes**
- ⚠️ **Triangle d'alerte** : Stock insuffisant
- ✅ **Check** : Stock suffisant
- ➕ **Plus** : Ajouter un produit/service
- 🗑️ **Poubelle** : Supprimer
- ✏️ **Crayon** : Modifier

---

## 📊 Avantages du Système

### **Pour la Gestion**
- ✅ **Visibilité complète** sur la consommation d'inventaire
- ✅ **Prévention des ruptures** de stock
- ✅ **Optimisation des commandes** de réapprovisionnement
- ✅ **Traçabilité** des consommations par service

### **Pour les Opérateurs**
- ✅ **Interface intuitive** pour créer des commandes
- ✅ **Alertes visuelles** claires
- ✅ **Blocage automatique** des commandes impossibles
- ✅ **Calculs automatiques** des besoins

### **Pour les Clients**
- ✅ **Commandes toujours réalisables** (stock vérifié)
- ✅ **Délais respectés** (pas de rupture surprise)
- ✅ **Qualité constante** (produits toujours disponibles)

---

## 🚀 Évolutions Possibles

### **Court terme**
- [ ] Sauvegarde des mappings en base de données
- [ ] Historique des modifications de configuration
- [ ] Export/Import des configurations

### **Moyen terme**
- [ ] Prédictions de consommation basées sur l'historique
- [ ] Suggestions automatiques de réapprovisionnement
- [ ] Intégration avec les fournisseurs

### **Long terme**
- [ ] Intelligence artificielle pour optimiser les stocks
- [ ] Intégration IoT pour suivi temps réel
- [ ] API pour systèmes externes

---

## 💡 Conseils d'Utilisation

1. **Testez régulièrement** vos configurations avec le simulateur
2. **Ajustez les quantités** selon votre expérience terrain
3. **Surveillez les alertes** de stock faible quotidiennement
4. **Formez votre équipe** à utiliser les nouvelles fonctionnalités
5. **Documentez** vos configurations spécifiques

---

*Ce système assure une cohérence parfaite entre votre inventaire et vos commandes, optimisant ainsi votre gestion de blanchisserie !* 🎯
