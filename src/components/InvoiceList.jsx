import { useState, useEffect } from 'react'
import { invoices } from '../services/api'
import { formatCurrency } from '../services/api'

export default function InvoiceList({ onNewInvoice, onEditInvoice, onPreviewInvoice }) {
  const [invoiceList, setInvoiceList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  async function loadInvoices() {
    try {
      const data = await invoices.getAll()
      setInvoiceList(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDuplicate(id) {
    if (!confirm('Dupliquer cette facture ?')) return
    try {
      await invoices.duplicate(id)
      await loadInvoices()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette facture ? Cette action est irréversible.')) return
    try {
      await invoices.delete(id)
      await loadInvoices()
    } catch (e) {
      setError(e.message)
    }
  }

  const filtered = invoiceList.filter((inv) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      inv.invoice_number?.toLowerCase().includes(term) ||
      inv.client_name?.toLowerCase().includes(term) ||
      inv.issue_date?.includes(term)
    )
  })

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Factures</h1>
        <button
          onClick={onNewInvoice}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nouvelle facture
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {filtered.length} facture(s)
          </h2>
          <input
            type="text"
            placeholder="Rechercher par numéro, client, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-80 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucune facture trouvée</p>
            <button
              onClick={onNewInvoice}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Créer votre première facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">N° Facture</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Lieu</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">Total TTC</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-blue-700">{inv.invoice_number}</td>
                    <td className="py-3 px-2 text-gray-600">{formatDate(inv.issue_date)}</td>
                    <td className="py-3 px-2">{inv.client_name || '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{inv.issue_location || '—'}</td>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => onPreviewInvoice(inv.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => onEditInvoice(inv.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDuplicate(inv.id)}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Dupliquer
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
