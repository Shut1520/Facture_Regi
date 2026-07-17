import { useState } from 'react'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import ClientManager from './components/ClientManager'
import InvoicePreview from './components/InvoicePreview'

const PAGES = {
  LIST: 'list',
  NEW_INVOICE: 'new_invoice',
  EDIT_INVOICE: 'edit_invoice',
  CLIENTS: 'clients',
  PREVIEW: 'preview',
}

export default function App() {
  const [page, setPage] = useState(PAGES.LIST)
  const [editingInvoiceId, setEditingInvoiceId] = useState(null)

  function goToNewInvoice() {
    setEditingInvoiceId(null)
    setPage(PAGES.NEW_INVOICE)
  }

  function goToEditInvoice(id) {
    setEditingInvoiceId(id)
    setPage(PAGES.EDIT_INVOICE)
  }

  function goToPreview(id) {
    setEditingInvoiceId(id)
    setPage(PAGES.PREVIEW)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
          <h1
            className="text-lg font-bold text-blue-700 cursor-pointer"
            onClick={() => setPage(PAGES.LIST)}
          >
            Facture Desktop
          </h1>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(PAGES.LIST)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === PAGES.LIST || page === PAGES.NEW_INVOICE || page === PAGES.EDIT_INVOICE || page === PAGES.PREVIEW
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Factures
            </button>
            <button
              onClick={() => setPage(PAGES.CLIENTS)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === PAGES.CLIENTS
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Clients
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main>
        {(page === PAGES.LIST) && (
          <InvoiceList
            onNewInvoice={goToNewInvoice}
            onEditInvoice={goToEditInvoice}
            onPreviewInvoice={goToPreview}
          />
        )}

        {(page === PAGES.NEW_INVOICE || page === PAGES.EDIT_INVOICE) && (
          <InvoiceForm
            key={editingInvoiceId || 'new'}
            editingInvoiceId={editingInvoiceId}
            onBack={() => setPage(PAGES.LIST)}
            onPreview={(id) => goToPreview(id)}
          />
        )}

        {page === PAGES.CLIENTS && (
          <ClientManager onBack={() => setPage(PAGES.LIST)} />
        )}

        {page === PAGES.PREVIEW && (
          <InvoicePreview
            invoiceId={editingInvoiceId}
            onBack={() => setPage(PAGES.LIST)}
          />
        )}
      </main>
    </div>
  )
}
