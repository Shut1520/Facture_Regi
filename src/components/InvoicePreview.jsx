import { useState, useEffect } from 'react'
import { getInvoiceFull } from '../services/db'
import { formatCurrency } from '../services/api'
import ExportModal from './ExportModal'

function formatDateFr(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = [
    'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function InvoicePreview({ invoiceId, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [invoiceId])

  async function loadInvoice() {
    try {
      const full = await getInvoiceFull(invoiceId)
      setData(full)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement de la facture...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Erreur : {error}
        </div>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          Retour
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Facture introuvable.</p>
        <button onClick={onBack} className="text-blue-600 hover:underline mt-4 block">
          Retour
        </button>
      </div>
    )
  }

  const client = data.client || {}
  const items = data.items || []

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-2xl">
          &#8592;
        </button>
        <h1 className="text-lg font-semibold text-gray-700">Apercu de la facture</h1>
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Exporter
        </button>
      </div>

      <div
        id="invoice-preview"
        className="bg-white shadow-lg mx-auto border border-gray-300"
        style={{ maxWidth: '100%', padding: '20mm 15mm', fontFamily: 'serif' }}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
              R
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-wide">
                {data.company_name || 'REGIDESO SA'}
              </h2>
              <p className="text-sm text-gray-600">
                {data.company_direction || 'DIRECTION REGIONALE DE KINSHASA EST'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right mb-4">
          <p className="text-sm">
            {data.issue_location || 'KINSHASA'}, le {formatDateFr(data.issue_date)}
          </p>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-bold underline tracking-wide">
            AVIS DE VENTE N°{data.invoice_number}
          </h3>
        </div>

        <div className="mb-6">
          <p className="font-bold mb-1">Informations du client :</p>
          <div className="ml-4 text-sm leading-relaxed">
            <p><span className="font-semibold">Nom :</span> {client.full_name || '—'}</p>
            {client.address && <p><span className="font-semibold">Adresse :</span> {client.address}</p>}
            {client.quarter && <p><span className="font-semibold">Quartier :</span> {client.quarter}</p>}
            {client.reference && <p><span className="font-semibold">Reference :</span> {client.reference}</p>}
            {client.phone && <p><span className="font-semibold">Telephone :</span> {client.phone}</p>}
          </div>
        </div>

        <div className="mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '12%' }}>
                  CAMION CITERNE (M3)
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '10%' }}>
                  COURSES
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '10%' }}>
                  QUANTITE
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '30%' }}>
                  DESIGNATION
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '19%' }}>
                  PRIX UNITAIRE
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center font-semibold" style={{ width: '19%' }}>
                  PRIX TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-400 px-2 py-6 text-center text-gray-400">
                    Aucune ligne
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-400 px-2 py-2 text-center">
                      {item.truck_capacity || '—'}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-center">
                      {item.trips_count || 1}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-center">
                      {item.quantity != null
                        ? Number(item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                        : ''}
                    </td>
                    <td className="border border-gray-400 px-2 py-2">
                      {item.designation}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-6 text-sm">
          <p className="italic text-gray-600">
            PRELEVEMENT DE L'EAU A L'USINE AVEC LE CAMION PRIVE
          </p>
          <p className="mt-1 text-gray-600">
            Contacts REGIDESO : 815064484
          </p>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
              <span className="font-semibold">TOTAL H.T.</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
              <span className="font-semibold">T.V.A. ({data.tax_rate}%)</span>
              <span>{formatCurrency(data.tax_amount)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg">
              <span className="font-bold">TOTAL TTC</span>
              <span className="font-bold text-blue-700">{formatCurrency(data.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center" style={{ width: '40%' }}>
            <div className="h-20" />
            <p className="border-t border-gray-400 pt-2 font-semibold">
              LE CHEF DE SECTION VENTE EAU
            </p>
          </div>
          <div className="text-center" style={{ width: '40%' }}>
            <div className="h-20" />
            <p className="border-t border-gray-400 pt-2 font-semibold">
              Pour LE CHEF DE DIVISION FINANCIERE
            </p>
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportModal
          invoiceId={invoiceId}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  )
}
