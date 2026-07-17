const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── COMPANIES ────────────────────────────────────────
  company: {
    getAll: () => ipcRenderer.invoke('company:getAll'),
    getById: (id) => ipcRenderer.invoke('company:getById', id),
    create: (data) => ipcRenderer.invoke('company:create', data),
    update: (id, data) => ipcRenderer.invoke('company:update', id, data),
    delete: (id) => ipcRenderer.invoke('company:delete', id),
  },

  // ─── CLIENTS ──────────────────────────────────────────
  client: {
    getAll: () => ipcRenderer.invoke('client:getAll'),
    getById: (id) => ipcRenderer.invoke('client:getById', id),
    search: (term) => ipcRenderer.invoke('client:search', term),
    create: (data) => ipcRenderer.invoke('client:create', data),
    update: (id, data) => ipcRenderer.invoke('client:update', id, data),
    delete: (id) => ipcRenderer.invoke('client:delete', id),
  },

  // ─── INVOICES ─────────────────────────────────────────
  invoice: {
    getAll: () => ipcRenderer.invoke('invoice:getAll'),
    getById: (id) => ipcRenderer.invoke('invoice:getById', id),
    getByNumber: (number) => ipcRenderer.invoke('invoice:getByNumber', number),
    getNextNumber: (year) => ipcRenderer.invoke('invoice:getNextNumber', year),
    create: (data) => ipcRenderer.invoke('invoice:create', data),
    update: (id, data) => ipcRenderer.invoke('invoice:update', id, data),
    delete: (id) => ipcRenderer.invoke('invoice:delete', id),
    duplicate: (id) => ipcRenderer.invoke('invoice:duplicate', id),
  },

  // ─── INVOICE ITEMS ────────────────────────────────────
  invoiceItem: {
    getByInvoiceId: (invoiceId) => ipcRenderer.invoke('invoiceItem:getByInvoiceId', invoiceId),
    getById: (id) => ipcRenderer.invoke('invoiceItem:getById', id),
    create: (data) => ipcRenderer.invoke('invoiceItem:create', data),
    update: (id, data) => ipcRenderer.invoke('invoiceItem:update', id, data),
    delete: (id) => ipcRenderer.invoke('invoiceItem:delete', id),
    recalculateTotals: (invoiceId) => ipcRenderer.invoke('invoiceItem:recalculateTotals', invoiceId),
  },
})
