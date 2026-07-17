const Database = require('better-sqlite3')
const path = require('node:path')
const fs = require('node:fs')

const DB_DIR = path.join(__dirname, '..', 'database')
const DB_PATH = path.join(DB_DIR, 'database.db')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      direction TEXT,
      logo_path TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      address TEXT,
      quarter TEXT,
      reference TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
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

    CREATE TABLE IF NOT EXISTS invoice_items (
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

    CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
    CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date);
    CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);
  `)
}

// ─── COMPANIES ──────────────────────────────────────────

const companyQueries = {
  getAll: () => db.prepare('SELECT * FROM companies ORDER BY name').all(),
  getById: (id) => db.prepare('SELECT * FROM companies WHERE id = ?').get(id),
  create: (data) => {
    const stmt = db.prepare(
      'INSERT INTO companies (name, direction, logo_path, address) VALUES (?, ?, ?, ?)'
    )
    const result = stmt.run(data.name, data.direction || null, data.logo_path || null, data.address || null)
    return db.prepare('SELECT * FROM companies WHERE id = ?').get(result.lastInsertRowid)
  },
  update: (id, data) => {
    const stmt = db.prepare(
      'UPDATE companies SET name = ?, direction = ?, logo_path = ?, address = ? WHERE id = ?'
    )
    stmt.run(data.name, data.direction || null, data.logo_path || null, data.address || null, id)
    return db.prepare('SELECT * FROM companies WHERE id = ?').get(id)
  },
  delete: (id) => db.prepare('DELETE FROM companies WHERE id = ?').run(id),
}

// ─── CLIENTS ────────────────────────────────────────────

const clientQueries = {
  getAll: () => db.prepare('SELECT * FROM clients ORDER BY full_name').all(),
  getById: (id) => db.prepare('SELECT * FROM clients WHERE id = ?').get(id),
  search: (term) =>
    db.prepare(
      `SELECT * FROM clients
       WHERE full_name LIKE ? OR phone LIKE ? OR address LIKE ?
       ORDER BY full_name LIMIT 50`
    ).all(`%${term}%`, `%${term}%`, `%${term}%`),
  create: (data) => {
    const stmt = db.prepare(
      'INSERT INTO clients (full_name, address, quarter, reference, phone) VALUES (?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      data.full_name,
      data.address || null,
      data.quarter || null,
      data.reference || null,
      data.phone || null
    )
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid)
  },
  update: (id, data) => {
    const stmt = db.prepare(
      `UPDATE clients
       SET full_name = ?, address = ?, quarter = ?, reference = ?, phone = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    stmt.run(data.full_name, data.address || null, data.quarter || null, data.reference || null, data.phone || null, id)
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id)
  },
  delete: (id) => db.prepare('DELETE FROM clients WHERE id = ?').run(id),
}

// ─── INVOICES ───────────────────────────────────────────

const invoiceQueries = {
  getAll: () =>
    db.prepare(
      `SELECT i.*, c.full_name AS client_name
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       ORDER BY i.issue_date DESC`
    ).all(),
  getById: (id) =>
    db.prepare(
      `SELECT i.*, c.full_name AS client_name
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`
    ).get(id),
  getByNumber: (number) =>
    db.prepare('SELECT * FROM invoices WHERE invoice_number = ?').get(number),
  getNextNumber: (year) => {
    const prefix = `DRKE/DM/%/${year}`
    const last = db
      .prepare(`SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1`)
      .get(`DRKE/DM/%/${year}`)
    if (!last) return `DRKE/DM/001/${year}`
    const match = last.invoice_number.match(/DRKE\/DM\/(\d+)\//)
    if (!match) return `DRKE/DM/001/${year}`
    const next = parseInt(match[1], 10) + 1
    return `DRKE/DM/${String(next).padStart(3, '0')}/${year}`
  },
  create: (data) => {
    const stmt = db.prepare(
      `INSERT INTO invoices
       (invoice_number, issue_date, issue_location, client_id, subtotal, tax_rate, tax_amount, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const result = stmt.run(
      data.invoice_number,
      data.issue_date,
      data.issue_location || null,
      data.client_id || null,
      data.subtotal || 0,
      data.tax_rate || 16,
      data.tax_amount || 0,
      data.total_amount || 0
    )
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(result.lastInsertRowid)
  },
  update: (id, data) => {
    const stmt = db.prepare(
      `UPDATE invoices
       SET invoice_number = ?, issue_date = ?, issue_location = ?, client_id = ?,
           subtotal = ?, tax_rate = ?, tax_amount = ?, total_amount = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    stmt.run(
      data.invoice_number,
      data.issue_date,
      data.issue_location || null,
      data.client_id || null,
      data.subtotal || 0,
      data.tax_rate || 16,
      data.tax_amount || 0,
      data.total_amount || 0,
      id
    )
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)
  },
  delete: (id) => db.prepare('DELETE FROM invoices WHERE id = ?').run(id),
  duplicate: (id) => {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)
    if (!invoice) return null
    const newNumber = invoiceQueries.getNextNumber(new Date().getFullYear())
    const newInvoice = invoiceQueries.create({
      invoice_number: newNumber,
      issue_date: new Date().toISOString().split('T')[0],
      issue_location: invoice.issue_location,
      client_id: invoice.client_id,
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
    })
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id)
    const insertItem = db.prepare(
      `INSERT INTO invoice_items
       (invoice_id, truck_capacity, trips_count, quantity, designation, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    for (const item of items) {
      insertItem.run(
        newInvoice.id, item.truck_capacity, item.trips_count,
        item.quantity, item.designation, item.unit_price, item.total_price
      )
    }
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(newInvoice.id)
  },
}

// ─── INVOICE ITEMS ──────────────────────────────────────

const invoiceItemQueries = {
  getByInvoiceId: (invoiceId) =>
    db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id').all(invoiceId),
  getById: (id) => db.prepare('SELECT * FROM invoice_items WHERE id = ?').get(id),
  create: (data) => {
    const stmt = db.prepare(
      `INSERT INTO invoice_items
       (invoice_id, truck_capacity, trips_count, quantity, designation, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    const result = stmt.run(
      data.invoice_id,
      data.truck_capacity || null,
      data.trips_count || 1,
      data.quantity,
      data.designation,
      data.unit_price,
      data.total_price
    )
    return db.prepare('SELECT * FROM invoice_items WHERE id = ?').get(result.lastInsertRowid)
  },
  update: (id, data) => {
    const stmt = db.prepare(
      `UPDATE invoice_items
       SET truck_capacity = ?, trips_count = ?, quantity = ?,
           designation = ?, unit_price = ?, total_price = ?
       WHERE id = ?`
    )
    stmt.run(
      data.truck_capacity || null,
      data.trips_count || 1,
      data.quantity,
      data.designation,
      data.unit_price,
      data.total_price,
      id
    )
    return db.prepare('SELECT * FROM invoice_items WHERE id = ?').get(id)
  },
  delete: (id) => db.prepare('DELETE FROM invoice_items WHERE id = ?').run(id),
  recalculateTotals: (invoiceId) => {
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId)
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
    const taxRate = invoice ? invoice.tax_rate : 16
    const taxAmount = Math.round(subtotal * taxRate) / 100
    const totalAmount = subtotal + taxAmount
    db.prepare(
      `UPDATE invoices SET subtotal = ?, tax_amount = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(subtotal, taxAmount, totalAmount, invoiceId)
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
  },
}

module.exports = {
  db,
  initDatabase,
  companyQueries,
  clientQueries,
  invoiceQueries,
  invoiceItemQueries,
}
