import { useState, useEffect } from 'react'
import { api, getCurrentUser } from '../../lib/api'
import { Mail, Plus, X, Send, Inbox, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react'

const TYPES_COURRIER = [
  { value: 'demande_complements', label: 'Demande de compléments' },
  { value: 'notification_instruction', label: 'Notification d\'instruction' },
  { value: 'invitation_commission', label: 'Invitation à la commission' },
  { value: 'notification_decision', label: 'Notification de décision' },
  { value: 'relance', label: 'Relance' },
  { value: 'autre', label: 'Autre' }
]

const STATUT_COLORS = {
  en_attente: 'bg-accent-lighter text-accent-slate',
  envoye: 'bg-blue-100 text-blue-700',
  recu: 'bg-yellow-100 text-yellow-700',
  lu: 'bg-green-100 text-secondary-600'
}

export default function GestionCourriers() {
  const [courriers, setCourriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('received')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState({
    destinataire_id: '', type_courrier: 'demande_complements',
    objet: '', contenu: '', demande_id: ''
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [usersList, setUsersList] = useState([])
  const user = getCurrentUser()

  useEffect(() => { loadData() }, [tab])
  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const result = await api.users.list()
    if (!result.error) setUsersList(result.users || [])
  }

  async function loadData() {
    setLoading(true)
    setError('')
    let result
    if (tab === 'received') result = await api.courriers.received()
    else if (tab === 'sent') result = await api.courriers.sent()
    else result = await api.courriers.list()
    if (result.error) { setError(result.error) }
    else { setCourriers(result.courriers || []) }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setActionLoading(true)
    const result = await api.courriers.create(formData)
    if (result.error) { setError(result.error) }
    else { setShowModal(false); setFormData({ destinataire_id: '', type_courrier: 'demande_complements', objet: '', contenu: '', demande_id: '' }); loadData() }
    setActionLoading(false)
  }

  async function handleSend(id) {
    setActionLoading(true)
    const result = await api.courriers.send(id)
    if (result.error) { setError(result.error) }
    else { loadData() }
    setActionLoading(false)
  }

  async function handleRead(id) {
    const result = await api.courriers.markAsRead(id)
    if (result.error) { setError(result.error) }
    else { setSelected(null); loadData() }
  }

  const canCreate = ['admin', 'dcuv', 'agentCourrier', 'secretaireCSA'].includes(user?.role)

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Gestion des courriers</h1>
      <p className="text-sm text-accent-slate mb-6">Courriers administratifs</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab('received')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'received' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
              <ArrowDownLeft className="h-4 w-4 inline mr-1" /> Reçus
            </button>
            {canCreate && (
              <button onClick={() => setTab('sent')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'sent' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
                <ArrowUpRight className="h-4 w-4 inline mr-1" /> Envoyés
              </button>
            )}
            <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'all' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
              Tous
            </button>
          </div>
          {canCreate && (
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Ajouter un courrier
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : courriers.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <Mail className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucun courrier</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courriers.map((c) => (
              <div key={c.id} className="bg-white shadow-sm rounded-lg p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelected(c)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-accent-dark">{c.reference || `#${c.id}`}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || ''}`}>{c.statut}</span>
                    </div>
                    <p className="text-sm font-medium text-accent-dark">{c.objet}</p>
                    <p className="text-xs text-accent-slate mt-1">
                      Type: {c.type_courrier} | Date: {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {c.statut === 'en_attente' && canCreate && (
                    <button onClick={(e) => { e.stopPropagation(); handleSend(c.id) }} disabled={actionLoading}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      <Send className="h-4 w-4 inline mr-1" /> Envoyer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">{selected.reference || `Courrier #${selected.id}`}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[selected.statut] || ''}`}>{selected.statut}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent-slate">Objet</p>
                <p className="text-sm text-accent-dark">{selected.objet}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent-slate">Type</p>
                <p className="text-sm text-accent-dark">{selected.type_courrier}</p>
              </div>
              {selected.contenu && (
                <div>
                  <p className="text-sm font-semibold text-accent-slate">Contenu</p>
                  <p className="text-sm text-accent-dark whitespace-pre-wrap p-3 bg-accent-lighter rounded">{selected.contenu}</p>
                </div>
              )}
              <div className="text-xs text-accent-slate space-y-1">
                <p>Date: {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
                {selected.date_envoi && <p>Envoyé le: {new Date(selected.date_envoi).toLocaleString('fr-FR')}</p>}
                {selected.date_reception && <p>Reçu le: {new Date(selected.date_reception).toLocaleString('fr-FR')}</p>}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              {(selected.statut === 'envoye' || selected.statut === 'recu') && (
                <button onClick={() => handleRead(selected.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Eye className="h-4 w-4 inline mr-1" /> Marquer comme lu
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Nouveau courrier</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Destinataire *</label>
                <select required value={formData.destinataire_id} onChange={(e) => setFormData({...formData, destinataire_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  <option value="">Sélectionner un destinataire</option>
                  {usersList.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom} — {u.role} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Type de courrier *</label>
                <select value={formData.type_courrier} onChange={(e) => setFormData({...formData, type_courrier: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  {TYPES_COURRIER.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Objet *</label>
                <input type="text" required value={formData.objet} onChange={(e) => setFormData({...formData, objet: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Contenu</label>
                <textarea rows={5} value={formData.contenu} onChange={(e) => setFormData({...formData, contenu: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">ID Demande (optionnel)</label>
                <input type="number" value={formData.demande_id} onChange={(e) => setFormData({...formData, demande_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
