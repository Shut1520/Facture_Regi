
---

## **CAHIER DES CHARGES - APPLICATION DE GESTION DE FACTURES**

### **1. CONTEXTE ET OBJECTIFS DU PROJET**

**1.1 Contexte**  
Développement d'une application desktop de génération de factures et documents commerciaux personnalisables, inspirée des modèles institutionnels (type REGIDESO).

**1.2 Objectifs**
- Permettre la saisie intuitive des données de facturation
- Générer des documents professionnels conformes aux normes
- Exporter en PDF et Excel avec mise en forme préservée
- Automatiser les calculs (TVA, totaux HT/TTC)
- Stockage local sécurisé des données

---

### **2. SPÉCIFICATIONS FONCTIONNELLES**

#### **2.1 Gestion des Modèles de Documents**

**Fonctionnalités requises :**
- **Bibliothèque de templates** : Factures, avis de vente, devis, bons de livraison
- **Personnalisation du template** : Logo, en-tête, pied de page, couleurs
- **Champs dynamiques** : Adaptation selon le type de document

#### **2.2 Saisie des Données**

**A. En-tête du document :**
- Logo de l'entreprise (upload image)
- Nom de l'entreprise (REGIDESO SA)
- Direction/Département (DIRECTION REGIONAL DE KINSHASA EST)
- Date et lieu (KINSHASA, le 14 JUILLET 2026)
- Numéro de document (AVIS DE VENTE N°DRKE/DM/078/2026)

**B. Informations Client :**
- Nom du client (NZONGOLA KAYEMBE ANTOINE)
- Adresse (104 AV. NGAFANI)
- Quartier/Commune (MONT NGAFULA)
- Référence (Entrée BEL AIR)
- Numéro de téléphone (815117713)

**C. Tableau de données (lignes de facture) :**
| Colonne | Type | Exemple |
|---------|------|---------|
| CAMION CITERNE EN (M3) | Nombre décimal | 12 |
| NOMBRE DES COURSES | Entier | 1 |
| QUANTITE | Nombre décimal | 12,00 |
| DESIGNATION | Texte multiligne | EAU POTABLE PAR CAMION CITERNE |
| PRIX UNITAIRE | Monétaire | 402 034,23 |
| PRIX TOTAL | Monétaire (calculé) | 299 252,36 |

**D. Sections supplémentaires :**
- Zone de texte libre (Contacts REGIDESO : 815064484)
- Mentions spécifiques (PRELEVEMENT DE L'EAU A L'USINE AVEC LE CAMION PRIVE)

**E. Totaux :**
- TOTAL H.T. (calcul automatique)
- T.V.A. (pourcentage configurable - ex: 16%)
- TOTAL TTC (calcul automatique)

**F. Signatures :**
- Zone signature 1 (LE CHEF DE SECTION VENTE EAU)
- Zone signature 2 (Pour LE CHEF DE DIVISION FINANCIERE)

#### **2.3 Fonctionnalités de Calcul**

- **Calcul automatique** : Quantité × Prix unitaire = Total ligne
- **Somme des totaux** : Total HT
- **Calcul TVA** : HT × Taux TVA
- **Total TTC** : HT + TVA
- **Arrondis** : Gestion des décimales (2 chiffres après virgule)

#### **2.4 Export et Génération**

**Formats d'export :**
1. **PDF** : 
   - Mise en forme identique au template
   - Qualité impression (300 DPI minimum)
   - Métadonnées (auteur, date, titre)
   
2. **Excel (.xlsx)** :
   - Préservation de la structure du tableau
   - Formules Excel pour les calculs
   - Mise en forme conditionnelle

**Fonctionnalités d'export :**
- Aperçu avant export
- Choix du dossier de destination
- Nommage automatique (ex: FACTURE_2026_078.pdf)
- Historique des exports

#### **2.5 Gestion des Données**

- **Base de données SQLite** : Stockage local des factures créées
- **Recherche** : Par numéro, client, date
- **Modification** : Édition des factures non exportées
- **Duplication** : Copier une facture existante
- **Archivage** : Conservation historique
- **Sauvegarde automatique** : Toutes les 5 minutes

#### **2.6 Gestion des Clients**

- **Fichier clients** : CRUD (Créer, Lire, Update, Delete) dans SQLite
- **Auto-complétion** : Suggestion lors de la saisie
- **Historique client** : Voir les factures précédentes

#### **2.7 Gestion des Produits/Services**

- **Catalogue** : Base de produits/services récurrents dans SQLite
- **Prix prédéfinis** : Tarif par produit
- **Insertion rapide** : Ajout depuis le catalogue

---

### **3. SPÉCIFICATIONS TECHNIQUES**

#### **3.1 Architecture de l'Application**

**Stack Technique :**
- **Framework Desktop** : Electron (version 28+)
- **Frontend** : React 18+ avec TypeScript
- **Bundler** : Vite (pour développement rapide)
- **Base de données** : SQLite via `better-sqlite3`
- **Langage** : TypeScript (recommandé) ou JavaScript

**Architecture Electron :**
- **Main Process (Node.js)** : 
  - Gestion des fenêtres
  - Accès au système de fichiers
  - Requêtes SQLite
  - Génération PDF/Excel
  
- **Renderer Process (React)** :
  - Interface utilisateur
  - Saisie des formulaires
  - Aperçu en temps réel
  - Communication via IPC (Inter-Process Communication)

#### **3.2 Bibliothèques et Dépendances**

**Dépendances principales :**
```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "better-sqlite3": "^9.0.0",
    "exceljs": "^4.3.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "electron-builder": "^24.9.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0"
  }
}
```

**Bibliothèques spécifiques :**
- **SQLite** : `better-sqlite3` (synchrone, performant)
- **Export PDF** : `win.webContents.printToPDF()` (natif Electron)
- **Export Excel** : `exceljs` (pour le styling avancé)
- **UI Framework** : Tailwind CSS + composants personnalisés
- **Validation** : Zod (schémas de validation)
- **Formulaires** : React Hook Form

#### **3.3 Schéma de la Base de Données SQLite**

```sql
-- Table des entreprises (émetteur)
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    direction TEXT,
    logo_path TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des clients
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    address TEXT,
    quarter TEXT,
    reference TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des factures (En-tête)
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    issue_location TEXT,
    client_id INTEGER,
    subtotal REAL DEFAULT 0,
    tax_rate REAL DEFAULT 16,
    tax_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table des lignes de facture (Détails)
CREATE TABLE invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    truck_capacity REAL,
    trips_count INTEGER DEFAULT 1,
    quantity REAL NOT NULL,
    designation TEXT NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_clients_name ON clients(full_name);
```

#### **3.4 Interface Utilisateur (UI/UX)**

**Composants React principaux :**
1. **`InvoiceForm.jsx`** : Formulaire de saisie multi-étapes
2. **`InvoicePreview.jsx`** : Aperçu WYSIWYG (What You See Is What You Get)
3. **`ClientManager.jsx`** : Gestion des clients (CRUD)
4. **`InvoiceList.jsx`** : Liste et recherche des factures
5. **`ExportModal.jsx`** : Modal d'export PDF/Excel

**Principes de conception :**
- Interface intuitive et épurée avec Tailwind CSS
- Navigation au clavier (Tab, Entrée)
- Validation en temps réel des champs
- Messages d'erreur clairs
- Thème clair/sombre optionnel
- Responsive design (adaptation à différentes résolutions)

**Communication IPC (Main ↔ Renderer) :**
```javascript
// Exemple de communication
// Renderer → Main
window.electronAPI.saveInvoice(invoiceData);

// Main → Renderer
ipcRenderer.on('invoice-saved', (event, data) => {
  // Mise à jour de l'UI
});
```

#### **3.5 Gestion des Fichiers et Assets**

**Structure des dossiers :**
```
mon-app-facture/
├── electron/
│   ├── main.js              # Point d'entrée Electron
│   ├── preload.js           # Scripts de sécurité (IPC bridge)
│   └── database.js          # Configuration SQLite
├── src/
│   ├── components/          # Composants React réutilisables
│   ├── pages/               # Pages principales
│   ├── services/            # Services API/IPC
│   ├── utils/               # Fonctions utilitaires
│   ├── styles/              # Feuilles de style globales
│   └── App.jsx
├── public/
│   ├── logos/               # Logos entreprises
│   ── templates/           # Templates de factures
└── database/
    └── database.db          # Fichier SQLite
```

#### **3.6 Sécurité**

- **Context Isolation** : Activation dans preload.js
- **Node Integration** : Désactivée dans le renderer
- **Validation des entrées** : Zod pour valider toutes les données
- **Chiffrement** : Optionnel pour les données sensibles
- **Sauvegarde automatique** : Toutes les 5 minutes
- **Gestion des erreurs** : Try-catch avec logs détaillés

#### **3.7 Performance**

- **Temps de génération PDF** : < 3 secondes
- **Ouverture de l'application** : < 5 secondes
- **Requêtes SQLite** : Utilisation d'index pour < 100ms
- **Support** : 10 000+ factures sans ralentissement
- **Mémoire RAM** : < 200MB en utilisation normale

---

### **4. EXIGENCES NON FONCTIONNELLES**

#### **4.1 Ergonomie**
- Formation utilisateur < 2 heures
- Documentation utilisateur intégrée (aide contextuelle)
- Support multi-langue (Français minimum)
- Accessibilité (navigation clavier, contrastes)

#### **4.2 Fiabilité**
- Disponibilité : 99%
- Gestion des erreurs (try-catch, logs)
- Récupération après crash (auto-save)
- Intégrité des données SQLite (transactions)

#### **4.3 Maintenance**
- Mises à jour automatiques via `electron-updater`
- Logs d'activité (fichier log.txt)
- Facilité de débogage (DevTools Electron)
- Versionning sémantique

#### **4.4 Conformité**
- Respect de la législation facturation (numérotation séquentielle)
- Conservation légale (10 ans minimum)
- Normes comptables locales (RDC)
- RGPD (protection des données clients)

---

### **5. LIVRABLES**

**5.1 Logiciel**
- Application installable Windows (.exe via electron-builder)
- Fichier de base de données SQLite
- Manuel d'installation
- Guide utilisateur (PDF)

**5.2 Documentation technique**
- Code source commenté (TypeScript/JavaScript)
- Schéma de la base de données
- Documentation API IPC
- Guide de déploiement

**5.3 Tests**
- Plan de tests
- Tests unitaires (Jest/Vitest)
- Tests d'intégration
- Tests d'acceptation utilisateur

---

### **6. PLANNING ET JALONS**

**Phases de développement :**

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **Phase 1** : Configuration et architecture | 1 semaine | Setup Electron+React+Vite, SQLite, IPC |
| **Phase 2** : Base de données et modèles | 1 semaine | Schéma SQLite, CRUD clients/factures |
| **Phase 3** : Interface de saisie | 2 semaines | Formulaires React, validation, calculs |
| **Phase 4** : Aperçu et template | 2 semaines | Composant InvoicePreview, CSS pixel-perfect |
| **Phase 5** : Export PDF/Excel | 2 semaines | Integration printToPDF, exceljs |
| **Phase 6** : Tests et optimisations | 1 semaine | Tests, bugs, performance |
| **Phase 7** : Packaging et déploiement | 1 semaine | electron-builder, .exe, documentation |

**Durée totale estimée : 10 semaines (~2,5 mois)**

---

### **7. CRITÈRES D'ACCEPTATION**

**Pour validation du projet :**
- ✓ Génération d'un PDF identique au modèle REGIDESO (pixel-perfect)
- ✓ Calculs automatiques exacts (HT, TVA, TTC)
- ✓ Export Excel fonctionnel avec formules et styling
- ✓ Interface intuitive (test utilisateur validé)
- ✓ Performance conforme (temps de réponse < 3s)
- ✓ Base de données SQLite opérationnelle (CRUD complet)
- ✓ Documentation complète (utilisateur + technique)
- ✓ Application packagée (.exe fonctionnel)

---

### **8. RISQUES ET MITIGATION**

| Risque | Impact | Solution |
|--------|--------|----------|
| Complexité du rendu PDF | Élevé | Utiliser printToPDF natif d'Electron + CSS précis |
| Performance SQLite | Moyen | Utiliser better-sqlite3 (synchrone) + index |
| Courbe d'apprentissage React | Moyen | Documentation, composants réutilisables |
| Compatibilité Windows | Faible | Tests sur Windows 10/11 dès le début |

---

### **9. PROCHAINES ÉTAPES**

1. **Valider ce cahier des charges** avec les parties prenantes
2. **Initialiser le projet** : `npm create vite@latest` + Electron
3. **Configurer SQLite** : Créer le schéma de base de données
4. **Développer le MVP** : Saisie → Aperçu → Export PDF
5. **Tests utilisateurs** : Validation du rendu avec l'image REGIDESO

---

