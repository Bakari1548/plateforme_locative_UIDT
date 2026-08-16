import { useState, useEffect } from 'react'
import { api, getCurrentUser } from '../../lib/api'
import { ArrowLeftRight, Clock, CheckCircle, XCircle, FileText, Home, X } from 'lucide-react'

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  valide: { label: 'Validé', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  refuse: { label: 'Refusé', color: 'bg-red-100 text-accent-red', icon: XCircle },
}

export default function TransfertLocal() {
  const [contrats, setContrats] = useState([])
  const [transferts, setTransferts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form, setForm] = useState({
    local_id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    numero_cni: '',
    motif: '',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    const [contratsRes, transfertsRes] = await Promise.all([
      api.contrats.my(),
      api.transferts.my()
    ])
    if (contratsRes.error) setError(contratsRes.error)
    else setContrats(contratsRes.contrats || [])
    if (transfertsRes.error) setError(transfertsRes.error)
    else setTransferts(transfertsRes.transferts || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.transferts.create(form)
    if (result.error) {
      setError(result.error)
    } else {
      setShowForm(false)
      setForm({ local_id: '', nom: '', prenom: '', email: '', telephone: '', numero_cni: '', motif: '' })
      loadData()
    }
    setActionLoading(false)
  }

  const activeContrats = contrats.filter(c => c.statut === 'actif' || c.statut === 'signe')

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Transfert de local</h1>
      <p className="text-sm text-accent-slate mb-6">Céder votre local à un nouveau demandeur</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          disabled={activeContrats.length === 0}
          className="px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Demander un transfert
        </button>
        {activeContrats.length === 0 && (
          <p className="text-xs text-accent-slate mt-2">Vous devez avoir un contrat actif pour demander un transfert.</p>
        )}
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : transferts.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <ArrowLeftRight className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucune demande de transfert</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transferts.map((t) => {
            const config = STATUT_CONFIG[t.statut] || STATUT_CONFIG.en_attente
            const Icon = config.icon
            return (
              <div key={t.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-semibold text-accent-dark">{t.local_reference || 'Local'}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <div className="text-sm text-accent-slate space-y-1">
                  <p><span className="font-medium">Nouveau demandeur:</span> {t.nouveau_prenom} {t.nouveau_nom}</p>
                  {t.motif && <p><span className="font-medium">Motif:</span> {t.motif}</p>}
                  <p><span className="font-medium">Date:</span> {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transfer form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Céder mon local</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-accent-slate" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Local à transférer *</label>
                <select
                  required
                  value={form.local_id}
                  onChange={(e) => setForm({ ...form, local_id: e.target.value })}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Sélectionner un local</option>
                  {activeContrats.map(c => (
                    <option key={c.id} value={c.local_id || ''}>
                      {c.local_reference || 'Local'} — {c.type_local} ({c.zone || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-accent-dark mb-3">Informations du nouveau demandeur</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Prénom *</label>
                  <input
                    type="text" required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Nom *</label>
                  <input
                    type="text" required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Email *</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Téléphone *</label>
                  <input
                    type="tel" required
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">N° CNI</label>
                  <input
                    type="text"
                    value={form.numero_cni}
                    onChange={(e) => setForm({ ...form, numero_cni: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Motif du transfert</label>
                <textarea
                  rows={3}
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  placeholder="Raison du transfert..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Le DCUV sera informé de cette demande et devra valider le transfert.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
                >
                  {actionLoading ? 'Envoi...' : 'Demander le transfert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
