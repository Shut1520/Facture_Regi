import { invoices, invoiceItems } from './api'
import { createEmptyItem, calculateItemTotal } from './api'

export async function createInvoiceWithItems(invoiceData, items) {
  const invoice = await invoices.create(invoiceData)

  for (const rawItem of items) {
    const total = calculateItemTotal(rawItem.quantity, rawItem.unit_price)
    await invoiceItem.create({ ...rawItem, invoice_id: invoice.id, total_price: total })
  }

  const updated = await invoices.recalculateTotals(invoice.id)
  return updated
}

export async function updateInvoiceWithItems(invoiceId, invoiceData, items) {
  await invoices.update(invoiceId, invoiceData)

  const existing = await invoiceItems.getByInvoiceId(invoiceId)
  const existingIds = new Set(existing.map((i) => i.id))
  const incomingIds = new Set(items.filter((i) => i.id).map((i) => i.id))

  for (const id of existingIds) {
    if (!incomingIds.has(id)) {
      await invoiceItems.delete(id)
    }
  }

  for (const rawItem of items) {
    const total = calculateItemTotal(rawItem.quantity, rawItem.unit_price)
    if (rawItem.id && existingIds.has(rawItem.id)) {
      await invoiceItems.update(rawItem.id, { ...rawItem, total_price: total })
    } else {
      await invoiceItems.create({ ...rawItem, invoice_id: invoiceId, total_price: total })
    }
  }

  const updated = await invoices.recalculateTotals(invoiceId)
  return updated
}

export async function getInvoiceFull(id) {
  const invoice = await invoices.getById(id)
  if (!invoice) return null
  const items = await invoiceItems.getByInvoiceId(id)
  return { ...invoice, items }
}

export async function duplicateInvoice(id) {
  return invoices.duplicate(id)
}

export async function deleteInvoice(id) {
  return invoices.delete(id)
}
