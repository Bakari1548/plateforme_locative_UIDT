import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { ShieldCheck, Gavel, Plus, X, ClipboardCheck, AlertCircle } from 'lucide-react'

const TYPES_CONTROLE = [
  { value: 'periodique', label: 'Périodique' },
  { value: 'signalement', label: 'Suite à signalement' },
  { value: 'fin_bail', label: 'Fin de bail' },
  { value: 'pre_affectation', label: 'Pré-affectation' }
]

const TYPES_SANCTION = [
  { value: 'avertissement', label: 'Avertissement' },
  { value: 'mise_en_demeure', label: 'Mise en demeure' },
  { value: 'penalite_financiere', label: 'Pénalité financière' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'resiliation_bail', label: 'Résiliation de bail' }
]

export default function ControleQHSE() {
  const [controles, setControles] = useState([])
  const [sanctions, setSanctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('controles')
  const [showControleModal, setShowControleModal] = useState(false)
  const [showSanctionModal, setShowSanctionModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(null)
  const [controleForm, setControleForm] = useState({ local_id: '', type_controle: 'periodique' })
  const [sanctionForm, setSanctionForm] = useState({
    locataire_id: '', type_sanction: 'avertissement', motif: '', description: '',
    local_id: '', controle_id: '', date_debut: '', date_fin: ''
  })
  const [scoreForm, setScoreForm] = useState({ score_proprete: '', score_securite: '', score_entretien: '', observations: '', recommandations: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [locauxList, setLocauxList] = useState([])
  const [locatairesList, setLocatairesList] = useState([])
  const [controlesList, setControlesList] = useState([])

  useEffect(() => { loadDropdownData() }, [])
  useEffect(() => { loadData() }, [tab])

  async function loadDropdownData() {
    const [locauxRes, locatairesRes, controlesRes] = await Promise.all([
      api.locaux.list(),
      api.users.getByRole('locataire'),
      api.controlesQhse.list()
    ])
    if (!locauxRes.error) setLocauxList(locauxRes.locaux || [])
    if (!locatairesRes.error) setLocatairesList(locatairesRes.users || [])
    if (!controlesRes.error) setControlesList(controlesRes.controles || [])
  }

  async function loadData() {
    setLoading(true)
    setError('')
    if (tab === 'controles') {
      const result = await api.controlesQhse.list()
      if (result.error) { setError(result.error) } else { setControles(result.controles || []) }
    } else {
      const result = await api.sanctions.active()
      if (result.error) { setError(result.error) } else { setSanctions(result.sanctions || []) }
    }
    setLoading(false)
  }

  async function handleCreateControle(e) {
    e.preventDefault()
    setActionLoading(true)
    const result = await api.controlesQhse.create(controleForm)
    if (result.error) { setError(result.error) }
    else { setShowControleModal(false); setControleForm({ local_id: '', type_controle: 'periodique' }); loadData() }
    setActionLoading(false)
  }

  async function handleCreateSanction(e) {
    e.preventDefault()
    setActionLoading(true)
    const result = await api.sanctions.create(sanctionForm)
    if (result.error) { setError(result.error) }
    else { setShowSanctionModal(false); setSanctionForm({ locataire_id: '', type_sanction: 'avertissement', motif: '', description: '', local_id: '', controle_id: '', date_debut: '', date_fin: '' }); loadData() }
    setActionLoading(false)
  }

  async function handleRecordScores(e) {
    e.preventDefault()
    setActionLoading(true)
    const result = await api.controlesQhse.recordScores(showScoreModal.id, scoreForm)
    if (result.error) { setError(result.error) }
    else { setShowScoreModal(null); setScoreForm({ score_proprete: '', score_securite: '', score_entretien: '', observations: '', recommandations: '' }); loadData() }
    setActionLoading(false)
  }

  async function handleLeverSanction(id) {
    if (!confirm('Lever cette sanction ?')) return
    const result = await api.sanctions.lever(id)
    if (result.error) { setError(result.error) }
    else { loadData() }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Contrôle QHSE</h1>
      <p className="text-sm text-accent-slate mb-6">Qualité, Hygiène, Sécurité et Environnement</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab('controles')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'controles' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Contrôles QHSE
          </button>
          <button onClick={() => setTab('sanctions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'sanctions' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Sanctions actives
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : tab === 'controles' ? (
          <>
            <div className="mb-4">
              <button onClick={() => setShowControleModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
                <Plus className="h-4 w-4 mr-2" /> Planifier un contrôle
              </button>
            </div>
            {controles.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center"><ClipboardCheck className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucun contrôle</p></div>
            ) : (
              <div className="space-y-4">
                {controles.map((c) => (
                  <div key={c.id} className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-accent-dark">{c.reference}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.statut === 'planifie' ? 'bg-blue-100 text-blue-700' :
                            c.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-700' :
                            c.statut === 'termine' ? 'bg-green-100 text-secondary-600' :
                            'bg-accent-lighter text-accent-slate'
                          }`}>{c.statut}</span>
                        </div>
                        <div className="text-sm text-accent-slate space-y-1">
                          <p><span className="font-medium">Local:</span> {c.local_reference || '-'}</p>
                          <p><span className="font-medium">Type:</span> {c.type_controle}</p>
                          <p><span className="font-medium">Date:</span> {new Date(c.date_controle).toLocaleDateString('fr-FR')}</p>
                          {c.score_global > 0 && (
                            <p><span className="font-medium">Score global:</span> <span className={c.score_global >= 80 ? 'text-secondary-600' : c.score_global >= 60 ? 'text-accent-orange' : 'text-accent-red'}>{c.score_global}/100</span></p>
                          )}
                          {c.observations && <p className="p-2 bg-accent-lighter rounded"><span className="font-medium">Observations:</span> {c.observations}</p>}
                        </div>
                      </div>
                      {c.statut === 'planifie' && (
                        <button onClick={() => { setShowScoreModal(c); setScoreForm({ score_proprete: '', score_securite: '', score_entretien: '', observations: '', recommandations: '' }) }}
                          className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800">
                          Enregistrer scores
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <button onClick={() => setShowSanctionModal(true)} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" /> Appliquer une sanction
              </button>
            </div>
            {sanctions.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center"><Gavel className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucune sanction active</p></div>
            ) : (
              <div className="space-y-4">
                {sanctions.map((s) => (
                  <div key={s.id} className="bg-white shadow-sm rounded-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-accent-dark">{s.reference}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-accent-red">{s.type_sanction}</span>
                        </div>
                        <div className="text-sm text-accent-slate space-y-1">
                          <p><span className="font-medium">Locataire:</span> {s.prenom} {s.nom}</p>
                          <p><span className="font-medium">Motif:</span> {s.motif}</p>
                          {s.description && <p><span className="font-medium">Description:</span> {s.description}</p>}
                          {s.local_reference && <p><span className="font-medium">Local:</span> {s.local_reference}</p>}
                          <p><span className="font-medium">Date:</span> {new Date(s.date_sanction).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <button onClick={() => handleLeverSanction(s.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Lever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      {/* modal */}
      {showControleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Planifier un contrôle</h2>
              <button onClick={() => setShowControleModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleCreateControle} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Local *</label>
                <select required value={controleForm.local_id} onChange={(e) => setControleForm({...controleForm, local_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  <option value="">Sélectionner un local</option>
                  {locauxList.map(l => <option key={l.id} value={l.id}>{l.reference} — {l.zone || 'N/A'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Type de contrôle *</label>
                <select value={controleForm.type_controle} onChange={(e) => setControleForm({...controleForm, type_controle: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  {TYPES_CONTROLE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowControleModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Score modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Scores: {showScoreModal.reference}</h2>
              <button onClick={() => setShowScoreModal(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleRecordScores} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Propreté (0-100)</label>
                  <input type="number" min="0" max="100" required value={scoreForm.score_proprete} onChange={(e) => setScoreForm({...scoreForm, score_proprete: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Sécurité (0-100)</label>
                  <input type="number" min="0" max="100" required value={scoreForm.score_securite} onChange={(e) => setScoreForm({...scoreForm, score_securite: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Entretien (0-100)</label>
                  <input type="number" min="0" max="100" required value={scoreForm.score_entretien} onChange={(e) => setScoreForm({...scoreForm, score_entretien: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Observations</label>
                <textarea rows={3} value={scoreForm.observations} onChange={(e) => setScoreForm({...scoreForm, observations: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Recommandations</label>
                <textarea rows={2} value={scoreForm.recommandations} onChange={(e) => setScoreForm({...scoreForm, recommandations: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScoreModal(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sanction modal */}
      {showSanctionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Appliquer une sanction</h2>
              <button onClick={() => setShowSanctionModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleCreateSanction} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Locataire *</label>
                <select required value={sanctionForm.locataire_id} onChange={(e) => setSanctionForm({...sanctionForm, locataire_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  <option value="">Sélectionner un locataire</option>
                  {locatairesList.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Type de sanction *</label>
                <select value={sanctionForm.type_sanction} onChange={(e) => setSanctionForm({...sanctionForm, type_sanction: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  {TYPES_SANCTION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Motif *</label>
                <input type="text" required value={sanctionForm.motif} onChange={(e) => setSanctionForm({...sanctionForm, motif: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Description</label>
                <textarea rows={3} value={sanctionForm.description} onChange={(e) => setSanctionForm({...sanctionForm, description: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Local</label>
                  <select value={sanctionForm.local_id} onChange={(e) => setSanctionForm({...sanctionForm, local_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                    <option value="">Sélectionner un local</option>
                    {locauxList.map(l => <option key={l.id} value={l.id}>{l.reference} — {l.zone || 'N/A'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Contrôle QHSE</label>
                  <select value={sanctionForm.controle_id} onChange={(e) => setSanctionForm({...sanctionForm, controle_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                    <option value="">Sélectionner un contrôle</option>
                    {controlesList.map(c => <option key={c.id} value={c.id}>{c.reference} — {c.type_controle}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date début</label>
                  <input type="date" value={sanctionForm.date_debut} onChange={(e) => setSanctionForm({...sanctionForm, date_debut: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date fin</label>
                  <input type="date" value={sanctionForm.date_fin} onChange={(e) => setSanctionForm({...sanctionForm, date_fin: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSanctionModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {actionLoading ? 'Création...' : 'Appliquer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
