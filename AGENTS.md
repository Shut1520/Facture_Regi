# AGENTS.md
toujours repondre en français

## Projet

**Facture_desktop** — Application desktop Electron de génération de factures et documents commerciaux (type REGIDESO).

## État actuel

Scaffolding initial terminé. Le projet contient Electron + React + Vite + Tailwind + SQLite opérationnels.

## Stack

- Electron 43+ + React 19+ + JavaScript (JSX) + Vite 8
- SQLite via `better-sqlite3` (synchrone)
- Tailwind CSS 4, React Hook Form, Zod (validation)
- `exceljs` (export Excel), `printToPDF()` natif Electron (PDF)
- `electron-builder` (packaging Windows .exe)
- Tests : Jest ou Vitest

## Architecture

```
Facture_desktop/
├── electron/
│   ├── main.js              # Entrée Electron (Main Process)
│   ├── preload.js           # IPC bridge, Context Isolation
│   └── database.js          # Config SQLite + schéma
├── src/
│   ├── components/          # InvoiceForm, InvoicePreview, ClientManager, InvoiceList, ExportModal
│   ├── pages/
│   ├── services/            # Services API/IPC
│   ├── utils/
│   ├── styles/              # Styles globaux Tailwind
│   └── App.jsx
├── public/
│   ├── logos/
│   └── templates/
├── database/
│   └── database.db          # Fichier SQLite (auto-créé)
└── Documentation/
    └── cahier_charge.md     # Cahier des charges complet
```

## Commandes

```bash
npm run dev          # Lance Vite + Electron (via concurrently)
npm run build        # Build Vite (dist/)
npm run start        # Lance Electron avec le build
npm run dist         # Build + package .exe (electron-builder)
npm run lint         # Linting (oxlint)
```

## Configuration Electron

- `package.json` → `"main": "electron/main.js"` (point d'entrée Electron)
- `contextIsolation: true`, `nodeIntegration: false` dans `BrowserWindow`
- Communication Main↔Renderer via `window.electronAPI.*` (défini dans `preload.js`)
- Dev : Vite lance sur `localhost:5173`, Electron charge cette URL via `VITE_DEV_SERVER_URL`

## Schéma Base de Données

```sql
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    direction TEXT,
    logo_path TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_clients_name ON clients(full_name);
```

## Règles Electron critiques

- **Context Isolation activé** dans preload.js
- **Node Integration désactivé** dans le renderer
- Communication Main↔Renderer via IPC : `window.electronAPI.*`
- Ne jamais importer Node.js directement dans les fichiers React

## Conventions clés

- TVA défaut 16%, configurable
- Numérotation factures : séquentielle, format `DRKE/DM/078/2026`
- Sauvegarde auto toutes les 5 minutes
- Export PDF : 300 DPI, métadonnées, pixel-perfect sur template REGIDESO
- Cible : Windows 10/11, langue Français

## Référence

Le cahier des charges complet est dans `Documentation/cahier_charge.md`. Il contient le planning (10 semaines, 7 phases), les critères d'acceptation, et les spécifications fonctionnelles détaillées.
