import { useState } from 'react'
import { exportPdf, exportExcel } from '../services/api'

export default function ExportModal({ invoiceId, onClose }) {
  const [loading, setLoading] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleExport(format) {
    setLoading(format)
    setError(null)
    setResult(null)
    try {
      const fn = format === 'pdf' ? exportPdf : exportExcel
      const res = await fn(invoiceId)
      if (res) {
        setResult({ format, path: res.filePath })
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Exporter la facture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            &#10005;
          </button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">Export reussi !</p>
            <p className="mt-1 text-green-600 break-all">{result.path}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            Erreur : {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loading === 'pdf' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>📄</span>
            )}
            PDF
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {loading === 'excel' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>📊</span>
            )}
            Excel (.xlsx)
          </button>
        </div>

        {result && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
