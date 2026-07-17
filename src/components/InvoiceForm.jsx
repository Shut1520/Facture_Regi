import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clients, invoices, invoiceItems } from '../services/api'
import {
  createEmptyItem,
  calculateItemTotal,
  calculateInvoiceTotals,
  formatCurrency,
} from '../services/api'
import { invoiceSchema } from '../utils/schemas'

export default function InvoiceForm({ onBack, onPreview, editingInvoiceId }) {
  const [clientList, setClientList] = useState([])
  const [items, setItems] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, totalAmount: 0 })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      issue_location: 'KINSHASA',
      client_id: '',
      tax_rate: 16,
    },
  })

  const taxRate = watch('tax_rate')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const newTotals = calculateInvoiceTotals(items, taxRate || 16)
    setTotals(newTotals)
  }, [items, taxRate])

  async function loadData() {
    try {
      const clientData = await clients.getAll()
      setClientList(clientData)

      if (editingInvoiceId) {
        const inv = await invoices.getById(editingInvoiceId)
        if (inv) {
          reset({
            invoice_number: inv.invoice_number,
            issue_date: inv.issue_date,
            issue_location: inv.issue_location || '',
            client_id: inv.client_id,
            tax_rate: inv.tax_rate,
          })
          const clientData2 = clientData.find((c) => c.id === inv.client_id)
          setSelectedClient(clientData2 || null)
          setClientSearch(clientData2?.full_name || '')
          const itemData = await invoiceItems.getByInvoiceId(editingInvoiceId)
          setItems(itemData)
        }
      } else {
        const year = new Date().getFullYear()
        const nextNumber = await invoices.getNextNumber(year)
        setValue('invoice_number', nextNumber)
      }
    } catch (e) {
      setError(e.message)
    }
  }

  async function searchClientList(term) {
    if (term.length < 2) {
      setClientList(await clients.getAll())
      return
    }
    const results = await clients.search(term)
    setClientList(results)
  }

  function selectClient(client) {
    setSelectedClient(client)
    setValue('client_id', client.id)
    setClientSearch(client.full_name)
    setShowClientDropdown(false)
  }

  function handleClientSearchChange(e) {
    const val = e.target.value
    setClientSearch(val)
    setShowClientDropdown(true)
    setSelectedClient(null)
    setValue('client_id', '')
    searchClientList(val)
  }

  function addItem() {
    const newItem = createEmptyItem(0)
    setItems([...items, newItem])
  }

  function updateItem(index, field, value) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updated[index].quantity) || 0
      const price = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(updated[index].unit_price) || 0
      updated[index].total_price = calculateItemTotal(qty, price)
    }

    setItems(updated)
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function onSubmit(formData) {
    if (!selectedClient) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (items.length === 0) {
      setError('Ajoutez au moins une ligne de facture')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const invoiceData = {
        ...formData,
        client_id: selectedClient.id,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
      }

      let invoiceId
      if (editingInvoiceId) {
        await invoices.update(editingInvoiceId, invoiceData)
        invoiceId = editingInvoiceId
        const existing = await invoiceItems.getByInvoiceId(invoiceId)
        const existingIds = new Set(existing.map((i) => i.id))
        const incomingIds = new Set(items.filter((i) => i.id).map((i) => i.id))

        for (const id of existingIds) {
          if (!incomingIds.has(id)) await invoiceItems.delete(id)
        }

        for (const item of items) {
          const itemData = { ...item, invoice_id: invoiceId }
          if (item.id && existingIds.has(item.id)) {
            await invoiceItems.update(item.id, itemData)
          } else {
            await invoiceItems.create(itemData)
          }
        }
      } else {
        const invoice = await invoices.create(invoiceData)
        invoiceId = invoice.id

        for (const item of items) {
          await invoiceItems.create({ ...item, invoice_id: invoiceId })
        }
      }

      await invoiceItems.recalculateTotals(invoiceId)

      if (onPreview) {
        onPreview(invoiceId)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm'
  const inputSmall = inputClass + ' text-center'
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {editingInvoiceId ? 'Modifier la facture' : 'Nouvelle facture'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* En-tête facture */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">N° Facture *</label>
              <input {...register('invoice_number')} className={inputClass} readOnly />
              {errors.invoice_number && <p className={errorClass}>{errors.invoice_number.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" {...register('issue_date')} className={inputClass} />
              {errors.issue_date && <p className={errorClass}>{errors.issue_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lieu</label>
              <input {...register('issue_location')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">TVA (%)</label>
              <input type="number" step="0.1" {...register('tax_rate')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Sélection client */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Client</h2>
          <div className="relative">
            <input
              type="text"
              value={clientSearch}
              onChange={handleClientSearchChange}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Rechercher un client..."
              className={inputClass}
            />
            {showClientDropdown && clientList.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {clientList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium">{c.full_name}</span>
                    <span className="text-gray-500 ml-2">
                      {c.phone && `Tel: ${c.phone}`}
                      {c.address && ` — ${c.address}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedClient && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
              <span className="font-medium text-blue-800">{selectedClient.full_name}</span>
              <span className="text-blue-600 ml-2">
                {selectedClient.address && `${selectedClient.address}`}
                {selectedClient.quarter && `, ${selectedClient.quarter}`}
                {selectedClient.phone && ` — Tel: ${selectedClient.phone}`}
              </span>
            </div>
          )}
          {errors.client_id && <p className={errorClass}>{errors.client_id.message}</p>}
        </div>

        {/* Lignes de facture */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Lignes de facture</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + Ajouter une ligne
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-2 px-1 text-center font-medium text-gray-600 w-20">Camion (m³)</th>
                    <th className="py-2 px-1 text-center font-medium text-gray-600 w-16">Courses</th>
                    <th className="py-2 px-1 text-center font-medium text-gray-600 w-20">Quantité</th>
                    <th className="py-2 px-1 text-left font-medium text-gray-600">Désignation</th>
                    <th className="py-2 px-1 text-right font-medium text-gray-600 w-28">Prix unitaire</th>
                    <th className="py-2 px-1 text-right font-medium text-gray-600 w-28">Prix total</th>
                    <th className="py-2 px-1 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.truck_capacity || ''}
                          onChange={(e) => updateItem(idx, 'truck_capacity', e.target.value)}
                          className={inputSmall}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="1"
                          value={item.trips_count || 1}
                          onChange={(e) => updateItem(idx, 'trips_count', e.target.value)}
                          className={inputSmall}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className={inputSmall}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={item.designation}
                          onChange={(e) => updateItem(idx, 'designation', e.target.value)}
                          className={inputClass}
                          placeholder="EAU POTABLE PAR CAMION CITERNE"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price || ''}
                          onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                          className={inputSmall}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 px-1 text-right font-medium text-gray-800 pr-3">
                        {formatCurrency(item.total_price || 0)}
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600 text-lg font-bold"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totaux */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Total H.T.</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">T.V.A. ({taxRate || 16}%)</span>
                <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg">
                <span className="font-bold text-gray-800">Total TTC</span>
                <span className="font-bold text-blue-600">{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Enregistrement...' : editingInvoiceId ? 'Mettre à jour' : 'Enregistrer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}
