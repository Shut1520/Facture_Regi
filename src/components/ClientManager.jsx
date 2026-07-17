import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clients } from '../services/api'
import { clientSchema } from '../utils/schemas'
import { createEmptyClient } from '../services/api'

export default function ClientManager({ onBack, onSelectClient }) {
  const [clientList, setClientList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: createEmptyClient(),
  })

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchClients()
    } else {
      loadClients()
    }
  }, [searchTerm])

  async function loadClients() {
    try {
      const data = await clients.getAll()
      setClientList(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  async function searchClients() {
    try {
      const data = await clients.search(searchTerm)
      setClientList(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  async function onSubmit(formData) {
    try {
      if (editingId) {
        await clients.update(editingId, formData)
      } else {
        await clients.create(formData)
      }
      reset(createEmptyClient())
      setEditingId(null)
      await loadClients()
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleEdit(client) {
    setEditingId(client.id)
    reset({
      full_name: client.full_name,
      address: client.address || '',
      quarter: client.quarter || '',
      reference: client.reference || '',
      phone: client.phone || '',
    })
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce client ?')) return
    try {
      await clients.delete(id)
      if (editingId === id) {
        setEditingId(null)
        reset(createEmptyClient())
      }
      await loadClients()
    } catch (e) {
      setError(e.message)
    }
  }

  function handleCancel() {
    setEditingId(null)
    reset(createEmptyClient())
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
  const errorClass = 'text-red-500 text-sm mt-1'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Clients</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? 'Modifier le client' : 'Nouveau client'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet *</label>
            <input {...register('full_name')} className={inputClass} placeholder="NZONGOLA KAYEMBE" />
            {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
            <input {...register('phone')} className={inputClass} placeholder="815117713" />
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Adresse</label>
            <input {...register('address')} className={inputClass} placeholder="104 AV. NGAFANI" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quartier/Commune</label>
            <input {...register('quarter')} className={inputClass} placeholder="MONT NGAFULA" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Référence</label>
            <input {...register('reference')} className={inputClass} placeholder="Entrée BEL AIR" />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {editingId ? 'Mettre à jour' : 'Créer le client'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Annuler
            </button>
          )}
          {onSelectClient && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium ml-auto"
            >
              Retour à la facture
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Liste des clients ({clientList.length})
          </h2>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
          />
        </div>

        {clientList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun client trouvé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Nom</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Téléphone</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Adresse</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Quartier</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientList.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{c.full_name}</td>
                    <td className="py-3 px-2 text-gray-600">{c.phone || '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{c.address || '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{c.quarter || '—'}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
