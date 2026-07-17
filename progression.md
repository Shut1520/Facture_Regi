# Progression du projet Facture Desktop

## Phase 1 : Configuration et architecture

- [x] Initialiser le projet Vite + React (JSX)
- [x] Installer Electron + better-sqlite3 + exceljs + react-hook-form + zod
- [x] Installer Tailwind CSS 4 + electron-builder
- [x] Configurer Vite avec plugin Tailwind
- [x] Créer `electron/main.js` (BrowserWindow + preload + contextIsolation)
- [x] Créer `electron/preload.js` (contextBridge + IPC)
- [x] Créer `electron/database.js` (schéma SQL + init)
- [x] Rebuild better-sqlite3 pour Electron (native module)
- [x] Configurer les scripts package.json (dev, build, start, dist)
- [x] Créer l'arborescence src/components/, src/pages/, src/services/, src/utils/, src/styles/
- [x] Vérifier que `npm run dev` lance Vite + Electron sans erreur
- [x] Mettre à jour AGENTS.md

## Phase 2 : Base de données et modèles

- [x] CRUD companies (créer, lire, modifier, supprimer)
- [x] CRUD clients (créer, lire, modifier, supprimer)
- [x] CRUD invoices (créer, lire, modifier, supprimer)
- [x] CRUD invoice_items (ajouter, modifier, supprimer lignes)
- [x] Services IPC pour chaque opération DB (ipcMain.handle)
- [x] API `window.electronAPI.*` dans preload.js
- [x] Service renderer pour appeler l'API IPC (src/services/api.js)
- [x] Auto-complétion clients (client:search dans preload.js)
- [x] Service db.js (CRUD complet avec calculs intégrés)
- [x] Test des CRUD via Electron (DB vérifiée)

## Phase 3 : Interface de saisie

- [ ] Composant `InvoiceForm.jsx` — formulaire multi-étapes
- [ ] Composant `ClientManager.jsx` — CRUD clients dans l'UI
- [ ] Composant `InvoiceList.jsx` — liste + recherche de factures
- [ ] Validation en temps réel (Zod + React Hook Form)
- [ ] Calcul automatique : quantité × prix unitaire = total ligne
- [ ] Calcul TVA (HT × taux) et Total TTC
- [ ] Formatage monétaire (séparateur de milliers, 2 décimales)
- [ ] Navigation clavier (Tab, Entrée)

## Phase 4 : Aperçu et template

- [ ] Composant `InvoicePreview.jsx` — aperçu WYSIWYG
- [ ] En-tête document (logo, entreprise, direction, date, numéro)
- [ ] Section client (nom, adresse, quartier, référence, téléphone)
- [ ] Tableau de données (camion citerne, courses, quantité, désignation, prix)
- [ ] Zone texte libre et mentions spécifiques
- [ ] Totaux (HT, TVA, TTC)
- [ ] Zones de signature
- [ ] CSS pixel-perfect sur template REGIDESO

## Phase 5 : Export PDF/Excel

- [ ] Export PDF via `printToPDF()` natif Electron
- [ ] Rendu 300 DPI, métadonnées, pixel-perfect
- [ ] Export Excel via `exceljs` (formules, styling conditionnel)
- [ ] Composant `ExportModal.jsx` — choix format + dossier destination
- [ ] Nommage automatique (ex: FACTURE_2026_078.pdf)
- [ ] Aperçu avant export
- [ ] Historique des exports

## Phase 6 : Tests et optimisations

- [ ] Tests unitaires (calculs, formatage, validation)
- [ ] Tests d'intégration (CRUD complet via IPC)
- [ ] Optimisation performance (< 3s PDF, < 5s ouverture)
- [ ] Sauvegarde auto toutes les 5 minutes
- [ ] Gestion des erreurs (try-catch, logs)
- [ ] Support 10 000+ factures

## Phase 7 : Packaging et déploiement

- [ ] Configurer electron-builder (app ID, icône, NSIS)
- [ ] Build production (`npm run dist` → .exe)
- [ ] Tester l'installeur .exe sur Windows
- [ ] Documentation utilisateur (guide PDF)
- [ ] Documentation technique (API IPC, schéma DB)
