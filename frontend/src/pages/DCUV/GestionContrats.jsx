import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { FileSignature, Send, CheckCircle, Clock, FileText, X } from 'lucide-react'

export default function GestionContrats() {
  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    decision_id: '', local_id: '', date_debut: '', date_fin: '',
    montant_loyer: '', periodicite: 'mensuel', caution: '', conditions_particulieres: ''
  })

  useEffect(() => {
    loadContrats()
  }, [tab])

  async function loadContrats() {
    setLoading(true)
    setError('')
    let result
    if (tab === 'pending') {
      result = await api.contrats.pending()
    } else if (tab === 'active') {
      result = await api.contrats.active()
    } else {
      result = await api.contrats.list()
    }
    if (result.error) {
      setError(result.error)
    } else {
      setContrats(result.contrats || [])
    }
    setLoading(false)
  }

  async function handleSendForSignature(id) {
    setActionLoading(true)
    const result = await api.contrats.sendForSignature(id)
    if (result.error) {
      setError(result.error)
    } else {
      loadContrats()
    }
    setActionLoading(false)
  }

  async function handleSignDcuv(id) {
    setActionLoading(true)
    const result = await api.contrats.signDcuv(id)
    if (result.error) {
      setError(result.error)
    } else {
      loadContrats()
    }
    setActionLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.contrats.create(createForm)
    if (result.error) {
      setError(result.error)
    } else {
      setShowCreate(false)
      setCreateForm({
        decision_id: '', local_id: '', date_debut: '', date_fin: '',
        montant_loyer: '', periodicite: 'mensuel', caution: '', conditions_particulieres: ''
      })
      loadContrats()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Gestion des contrats</h1>
      <p className="text-sm text-accent-slate mb-6">Création et suivi des contrats</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'pending' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'active' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            Contrats actifs
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'all' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            Tous
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : contrats.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <FileSignature className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucun contrat trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contrats.map((c) => (
              <div key={c.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-accent-dark">{c.reference}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.statut === 'actif' ? 'bg-green-100 text-secondary-600' :
                        c.statut === 'signe' ? 'bg-blue-100 text-blue-700' :
                        c.statut === 'en_attente_signature' ? 'bg-yellow-100 text-yellow-700' :
                        c.statut === 'resilie' ? 'bg-red-100 text-accent-red' :
                        'bg-accent-lighter text-accent-slate'
                      }`}>
                        {c.statut}
                      </span>
                    </div>
                    <div className="text-sm text-accent-slate space-y-1">
                      <p><span className="font-medium">Locataire:</span> {c.prenom} {c.nom}</p>
                      <p><span className="font-medium">N° suivi:</span> {c.numero_suivi}</p>
                      <p><span className="font-medium">Date début:</span> {new Date(c.date_debut).toLocaleDateString('fr-FR')}</p>
                      {c.montant_loyer && <p><span className="font-medium">Loyer:</span> {c.montant_loyer} FCFA / {c.periodicite}</p>}
                      <p><span className="font-medium">Signé locataire:</span> {c.signe_par_locataire ? '✓' : '✗'}</p>
                      <p><span className="font-medium">Signé DCUV:</span> {c.signe_par_dcuv ? '✓' : '✗'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {c.statut === 'brouillon' && (
                      <button
                        onClick={() => handleSendForSignature(c.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
                      >
                        <Send className="h-4 w-4 inline mr-1" />
                        Envoyer
                      </button>
                    )}
                    {c.statut === 'en_attente_signature' && !c.signe_par_dcuv && (
                      <button
                        onClick={() => handleSignDcuv(c.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Signer DCUV
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(c)}
                      className="px-3 py-1.5 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Créer un contrat</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="h-5 w-5 text-accent-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">ID Décision *</label>
                <input
                  type="number" required
                  value={createForm.decision_id}
                  onChange={(e) => setCreateForm({...createForm, decision_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">ID Local</label>
                <input
                  type="number"
                  value={createForm.local_id}
                  onChange={(e) => setCreateForm({...createForm, local_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date début *</label>
                  <input
                    type="date" required
                    value={createForm.date_debut}
                    onChange={(e) => setCreateForm({...createForm, date_debut: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date fin</label>
                  <input
                    type="date"
                    value={createForm.date_fin}
                    onChange={(e) => setCreateForm({...createForm, date_fin: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Loyer mensuel</label>
                  <input
                    type="number" step="0.01"
                    value={createForm.montant_loyer}
                    onChange={(e) => setCreateForm({...createForm, montant_loyer: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Caution</label>
                  <input
                    type="number" step="0.01"
                    value={createForm.caution}
                    onChange={(e) => setCreateForm({...createForm, caution: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Périodicité</label>
                <select
                  value={createForm.periodicite}
                  onChange={(e) => setCreateForm({...createForm, periodicite: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Conditions particulières</label>
                <textarea
                  rows={3}
                  value={createForm.conditions_particulieres}
                  onChange={(e) => setCreateForm({...createForm, conditions_particulieres: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
                >
                  {actionLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">{selected.reference}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="h-5 w-5 text-accent-slate" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm text-accent-slate">
              <p><span className="font-medium">Statut:</span> {selected.statut}</p>
              <p><span className="font-medium">Locataire:</span> {selected.prenom} {selected.nom}</p>
              <p><span className="font-medium">N° suivi:</span> {selected.numero_suivi}</p>
              <p><span className="font-medium">Date début:</span> {new Date(selected.date_debut).toLocaleDateString('fr-FR')}</p>
              {selected.date_fin && <p><span className="font-medium">Date fin:</span> {new Date(selected.date_fin).toLocaleDateString('fr-FR')}</p>}
              {selected.montant_loyer && <p><span className="font-medium">Loyer:</span> {selected.montant_loyer} FCFA</p>}
              {selected.caution && <p><span className="font-medium">Caution:</span> {selected.caution} FCFA</p>}
              <p><span className="font-medium">Signé locataire:</span> {selected.signe_par_locataire ? 'Oui' : 'Non'}</p>
              <p><span className="font-medium">Signé DCUV:</span> {selected.signe_par_dcuv ? 'Oui' : 'Non'}</p>
              {selected.conditions_particulieres && (
                <p><span className="font-medium">Conditions:</span> {selected.conditions_particulieres}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
