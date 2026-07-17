const api = window.electronAPI

// ─── COMPANIES ──────────────────────────────────────────

export const companies = {
  getAll: () => api.company.getAll(),
  getById: (id) => api.company.getById(id),
  create: (data) => api.company.create(data),
  update: (id, data) => api.company.update(id, data),
  delete: (id) => api.company.delete(id),
}

// ─── CLIENTS ────────────────────────────────────────────

export const clients = {
  getAll: () => api.client.getAll(),
  getById: (id) => api.client.getById(id),
  search: (term) => api.client.search(term),
  create: (data) => api.client.create(data),
  update: (id, data) => api.client.update(id, data),
  delete: (id) => api.client.delete(id),
}

// ─── INVOICES ───────────────────────────────────────────

export const invoices = {
  getAll: () => api.invoice.getAll(),
  getById: (id) => api.invoice.getById(id),
  getByNumber: (number) => api.invoice.getByNumber(number),
  getNextNumber: (year) => api.invoice.getNextNumber(year),
  create: (data) => api.invoice.create(data),
  update: (id, data) => api.invoice.update(id, data),
  delete: (id) => api.invoice.delete(id),
  duplicate: (id) => api.invoice.duplicate(id),
}

// ─── INVOICE ITEMS ──────────────────────────────────────

export const invoiceItems = {
  getByInvoiceId: (invoiceId) => api.invoiceItem.getByInvoiceId(invoiceId),
  getById: (id) => api.invoiceItem.getById(id),
  create: (data) => api.invoiceItem.create(data),
  update: (id, data) => api.invoiceItem.update(id, data),
  delete: (id) => api.invoiceItem.delete(id),
  recalculateTotals: (invoiceId) => api.invoiceItem.recalculateTotals(invoiceId),
}

// ─── FACTORY ────────────────────────────────────────────

export function createEmptyInvoice(year = new Date().getFullYear()) {
  return {
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    issue_location: 'KINSHASA',
    client_id: null,
    subtotal: 0,
    tax_rate: 16,
    tax_amount: 0,
    total_amount: 0,
  }
}

export function createEmptyClient() {
  return {
    full_name: '',
    address: '',
    quarter: '',
    reference: '',
    phone: '',
  }
}

export function createEmptyItem(invoiceId) {
  return {
    invoice_id: invoiceId,
    truck_capacity: 0,
    trips_count: 1,
    quantity: 0,
    designation: '',
    unit_price: 0,
    total_price: 0,
  }
}

export function calculateItemTotal(quantity, unitPrice) {
  return Math.round(quantity * unitPrice * 100) / 100
}

export function calculateInvoiceTotals(items, taxRate = 16) {
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0)
  const taxAmount = Math.round(subtotal * taxRate) / 100
  const totalAmount = subtotal + taxAmount
  return { subtotal, taxAmount, totalAmount }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
