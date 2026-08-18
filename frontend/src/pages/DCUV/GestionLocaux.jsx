import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Building2, Plus, Edit, Trash2, Search, X, ArrowRightLeft, MoreVertical, Eye } from 'lucide-react'

const TYPES = ['cantine', 'boutique', 'kiosque', 'bureau', 'autre']
const STATUTS = ['disponible', 'occupe', 'en_maintenance', 'reserve', 'inactif']

const STATUT_COLORS = {
  disponible: 'bg-green-100 text-secondary-600',
  occupe: 'bg-blue-100 text-blue-700',
  en_maintenance: 'bg-yellow-100 text-yellow-700',
  reserve: 'bg-purple-100 text-purple-700',
  inactif: 'bg-accent-lighter text-accent-slate'
}

export default function GestionLocaux() {
  const [locaux, setLocaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLocal, setEditingLocal] = useState(null)
  const [formData, setFormData] = useState({
    reference: '', type: 'cantine', usage: '', statut: 'disponible',
    zone: '', surface: '', description: ''
  })
  const [selected, setSelected] = useState(null)
  const [transferts, setTransferts] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [tab, setTab] = useState('locaux')
  const [pendingTransferts, setPendingTransferts] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadLocaux() }, [])

  useEffect(() => {
    if (tab === 'transferts') loadPendingTransferts()
  }, [tab])

  useEffect(() => {
    function handleClickOutside() { setMenuOpenId(null) }
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpenId])

  async function showDetails(local) {
    setSelected(local)
    const result = await api.locaux.transferts(local.id)
    setTransferts(result.error ? [] : (result.transferts || []))
  }

  async function loadLocaux() {
    setLoading(true)
    const result = await api.locaux.list()
    if (result.error) { setError(result.error) }
    else { setLocaux(result.locaux || []) }
    setLoading(false)
  }

  async function loadPendingTransferts() {
    setLoading(true)
    const result = await api.transferts.pending()
    if (result.error) { setError(result.error) }
    else { setPendingTransferts(result.transferts || []) }
    setLoading(false)
  }

  async function handleValidateTransfert(id, statut) {
    setActionLoading(true)
    const result = await api.transferts.validate(id, statut)
    if (result.error) { setError(result.error) }
    else { loadPendingTransferts() }
    setActionLoading(false)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) { loadLocaux(); return }
    setLoading(true)
    const result = await api.locaux.search(searchQuery)
    if (result.error) { setError(result.error) }
    else { setLocaux(result.locaux || []) }
    setLoading(false)
  }

  function openModal(local = null) {
    if (local) {
      setEditingLocal(local)
      setFormData({
        reference: local.reference || '', type: local.type || 'cantine',
        usage: local.usage || '', statut: local.statut || 'disponible',
        zone: local.zone || '', surface: local.surface || '', description: local.description || ''
      })
    } else {
      setEditingLocal(null)
      setFormData({ reference: '', type: 'cantine', usage: '', statut: 'disponible', zone: '', surface: '', description: '' })
    }
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    let result
    if (editingLocal) {
      result = await api.locaux.update(editingLocal.id, formData)
    } else {
      result = await api.locaux.create(formData)
    }
    if (result.error) { setError(result.error) }
    else { setShowModal(false); loadLocaux() }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce local ?')) return
    const result = await api.locaux.delete(id)
    if (result.error) { setError(result.error) }
    else { loadLocaux() }
  }

  async function handleStatutChange(id, statut) {
    const result = await api.locaux.updateStatut(id, statut)
    if (result.error) { setError(result.error) }
    else { loadLocaux() }
  }

  const filteredLocaux = filterStatut ? locaux.filter(l => l.statut === filterStatut) : locaux

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Gestion des locaux</h1>
      <p className="text-sm text-accent-slate mb-6">Référentiel des locaux</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab('locaux')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'locaux' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            Locaux
          </button>
          <button
            onClick={() => setTab('transferts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'transferts' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            Transferts en attente
            {pendingTransferts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{pendingTransferts.length}</span>
            )}
          </button>
        </div>

        {tab === 'transferts' ? (
          loading ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
          ) : pendingTransferts.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <ArrowRightLeft className="h-12 w-12 text-accent-light mx-auto mb-3" />
              <p className="text-accent-slate">Aucun transfert en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransferts.map((t) => (
                <div key={t.id} className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-accent-dark">{t.local_reference || 'Local'}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">En attente</span>
                      </div>
                      <div className="text-sm text-accent-slate space-y-1">
                        <p><span className="font-medium">Ancien locataire:</span> {t.ancien_prenom || 'N/A'} {t.ancien_nom || ''}</p>
                        <p><span className="font-medium">Nouveau demandeur:</span> {t.nouveau_prenom} {t.nouveau_nom}</p>
                        {t.motif && <p><span className="font-medium">Motif:</span> {t.motif}</p>}
                        <p><span className="font-medium">Date:</span> {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleValidateTransfert(t.id, 'valide')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => handleValidateTransfert(t.id, 'refuse')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
          <div className="mb-6 flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-slate" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par référence, zone..."
                className="w-full pl-10 pr-4 py-2 border border-accent-light rounded-lg focus:outline-none focus:ring-primary-500" />
            </div>
            <button type="submit" className="px-4 py-2 bg-accent-dark text-white rounded-lg hover:bg-accent-slate">Rechercher</button>
          </form>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
            className="border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
            <option value="">Tous statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un local
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : filteredLocaux.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <Building2 className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucun local trouvé</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-accent-light">
              <thead className="bg-accent-lighter">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Surface</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-accent-slate uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-accent-light">
                {filteredLocaux.map((local) => (
                  <tr key={local.id} className="hover:bg-accent-lighter">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-dark">{local.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{local.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{local.usage || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{local.zone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{local.surface ? `${local.surface} m²` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select value={local.statut} onChange={(e) => handleStatutChange(local.id, e.target.value)}
                        className={`text-sm rounded-lg border-0 focus:outline-none focus:ring-primary-500 ${STATUT_COLORS[local.statut] || ''}`}>
                        {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === local.id ? null : local.id) }}
                        className="text-accent-slate hover:text-accent-dark">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {menuOpenId === local.id && (
                        <div className="absolute right-6 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border border-accent-light py-1 w-40" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setMenuOpenId(null); showDetails(local) }}
                            className="w-full text-left px-4 py-2 text-sm text-accent-dark hover:bg-accent-lighter flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Détails
                          </button>
                          <button onClick={() => { setMenuOpenId(null); openModal(local) }}
                            className="w-full text-left px-4 py-2 text-sm text-accent-dark hover:bg-accent-lighter flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Modifier
                          </button>
                          <button onClick={() => { setMenuOpenId(null); handleDelete(local.id) }}
                            className="w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          </>
        )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">{editingLocal ? 'Modifier local' : 'Nouveau local'}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {editingLocal && (
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Référence</label>
                  <input type="text" value={formData.reference} disabled
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 bg-accent-lighter text-accent-slate" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Statut</label>
                  <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                    {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Usage *</label>
                <input type="text" required value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Zone</label>
                  <input type="text" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Surface (m²)</label>
                  <input type="number" step="0.01" value={formData.surface} onChange={(e) => setFormData({...formData, surface: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">{editingLocal ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Détails: {selected.reference}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold text-accent-slate">Type:</span> <span className="text-accent-dark">{selected.type}</span></div>
                <div><span className="font-semibold text-accent-slate">Usage:</span> <span className="text-accent-dark">{selected.usage || '-'}</span></div>
                <div><span className="font-semibold text-accent-slate">Zone:</span> <span className="text-accent-dark">{selected.zone || '-'}</span></div>
                <div><span className="font-semibold text-accent-slate">Surface:</span> <span className="text-accent-dark">{selected.surface ? `${selected.surface} m²` : '-'}</span></div>
                <div><span className="font-semibold text-accent-slate">Statut:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[selected.statut] || ''}`}>{selected.statut}</span></div>
                <div><span className="font-semibold text-accent-slate">Créé le:</span> <span className="text-accent-dark">{new Date(selected.created_at).toLocaleDateString('fr-FR')}</span></div>
              </div>
              {selected.description && (
                <div>
                  <p className="font-semibold text-accent-slate mb-1">Description</p>
                  <p className="text-accent-dark p-3 bg-accent-lighter rounded">{selected.description}</p>
                </div>
              )}
              <div>
                <p className="font-semibold text-accent-slate mb-1">Historique des transferts</p>
                {transferts.length === 0 ? (
                  <p className="text-accent-slate">Aucun transfert enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {transferts.map((t) => (
                      <div key={t.id} className="p-2 bg-accent-lighter rounded text-xs">
                        <p><span className="font-medium">Réf:</span> {t.reference || `#${t.id}`} — <span className="font-medium">Statut:</span> {t.statut}</p>
                        <p><span className="font-medium">Date:</span> {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={() => { setSelected(null); openModal(selected) }} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">Modifier</button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
