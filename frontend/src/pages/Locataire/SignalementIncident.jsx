import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { AlertTriangle, Plus, X, Camera, Clock, CheckCircle } from 'lucide-react'

const TYPES = [
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'structure', label: 'Structure' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'nettoyage', label: 'Nettoyage' },
  { value: 'autre', label: 'Autre' }
]

const URGENCES = [
  { value: 'faible', label: 'Faible', color: 'bg-accent-lighter text-accent-slate' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  { value: 'critique', label: 'Critique', color: 'bg-red-100 text-accent-red' }
]

const STATUT_COLORS = {
  signale: 'bg-yellow-100 text-yellow-700',
  en_attente: 'bg-blue-100 text-blue-700',
  pris_en_charge: 'bg-purple-100 text-purple-700',
  en_cours: 'bg-orange-100 text-orange-700',
  resolu: 'bg-green-100 text-secondary-600',
  cloture: 'bg-accent-lighter text-accent-slate',
  rejete: 'bg-red-100 text-accent-red'
}

export default function SignalementIncident() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    type_incident: '', description: '', urgence: 'normal',
    local_id: '', contrat_id: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadIncidents() }, [])

  async function loadIncidents() {
    setLoading(true)
    const result = await api.incidents.list()
    if (result.error) { setError(result.error) }
    else { setIncidents(result.incidents || []) }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.incidents.create(formData)
    if (result.error) { setError(result.error) }
    else { setShowModal(false); setFormData({ type_incident: '', description: '', urgence: 'normal', local_id: '', contrat_id: '' }); loadIncidents() }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Signalement d'incidents</h1>
      <p className="text-sm text-accent-slate mb-6">Signaler et suivre les incidents</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate mb-4">Aucun incident signalé</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
              Signaler un incident
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => {
              const urgence = URGENCES.find(u => u.value === inc.urgence) || URGENCES[1]
              return <div key={inc.id} className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-accent-dark">{inc.reference}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${urgence.color}`}>{urgence.label}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[inc.statut] || ''}`}>{inc.statut}</span>
                      </div>
                      <div className="text-sm text-accent-slate space-y-1">
                        <p><span className="font-medium">Type:</span> {inc.type_incident}</p>
                        <p><span className="font-medium">Description:</span> {inc.description}</p>
                        {inc.local_reference && <p><span className="font-medium">Local:</span> {inc.local_reference}</p>}
                        <p><span className="font-medium">Date:</span> {new Date(inc.date_signalement).toLocaleDateString('fr-FR')}</p>
                        {inc.prise_en_charge_crous && <p className="text-secondary-600"><CheckCircle className="h-4 w-4 inline mr-1" />Pris en charge par le CROUS</p>}
                        {inc.commentaire_validation && <p className="p-2 bg-accent-lighter rounded"><span className="font-medium">Commentaire DCUV:</span> {inc.commentaire_validation}</p>}
                      </div>
                    </div>
                  </div>
                </div>
            })}
          </div>
        )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Signaler un incident</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Type d'incident *</label>
                <select required value={formData.type_incident} onChange={(e) => setFormData({...formData, type_incident: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  <option value="">Sélectionner...</option>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Niveau d'urgence</label>
                <select value={formData.urgence} onChange={(e) => setFormData({...formData, urgence: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  {URGENCES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Description *</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez l'incident en détail..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">ID Local</label>
                  <input type="number" value={formData.local_id} onChange={(e) => setFormData({...formData, local_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">ID Contrat</label>
                  <input type="number" value={formData.contrat_id} onChange={(e) => setFormData({...formData, contrat_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div className="bg-accent-lighter border border-accent-light rounded-lg p-3 text-sm text-accent-slate">
                <Camera className="h-4 w-4 inline mr-1" />
                L'upload de photos sera disponible dans une prochaine version.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Envoi...' : 'Signaler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
