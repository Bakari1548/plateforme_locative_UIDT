import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { DollarSign, FileText, AlertTriangle, TrendingUp, X } from 'lucide-react'

export default function EnregistrementPaiement() {
  const [paiements, setPaiements] = useState([])
  const [overdue, setOverdue] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('recent')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    contrat_id: '', locataire_id: '', montant: '', mode_paiement: 'especes',
    echeance_id: '', periode: '', commentaire: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    setLoading(true)
    setError('')
    if (tab === 'recent') {
      const result = await api.paiements.list()
      if (result.error) { setError(result.error) } else { setPaiements(result.paiements || []) }
    } else if (tab === 'overdue') {
      const result = await api.paiements.overdue()
      if (result.error) { setError(result.error) }
      else { setOverdue(result.locataires_retard || []) }
    } else if (tab === 'stats') {
      const result = await api.paiements.stats()
      if (result.error) { setError(result.error) } else { setStats(result.stats) }
    }
    setLoading(false)
  }

  async function handleRecord(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.paiements.record(formData)
    if (result.error) { setError(result.error) }
    else { setShowModal(false); setFormData({ contrat_id: '', locataire_id: '', montant: '', mode_paiement: 'especes', echeance_id: '', periode: '', commentaire: '' }); loadData() }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Recouvrement</h1>
      <p className="text-sm text-accent-slate mb-6">Enregistrement des paiements</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab('recent')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'recent' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Paiements récents
          </button>
          <button onClick={() => setTab('overdue')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'overdue' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Retards
          </button>
          <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'stats' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Statistiques
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : tab === 'recent' ? (
          paiements.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><DollarSign className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucun paiement</p></div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-accent-light">
                <thead className="bg-accent-lighter">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Locataire</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Contrat</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase">Référence</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-accent-light">
                  {paiements.map((p) => (
                    <tr key={p.id} className="hover:bg-accent-lighter">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{p.prenom} {p.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{p.contrat_reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-dark">{p.montant} FCFA</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{p.mode_paiement}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-slate">{p.reference_recu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : tab === 'overdue' ? (
          overdue.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><TrendingUp className="h-12 w-12 text-green-300 mx-auto mb-3" /><p className="text-accent-slate">Aucun retard détecté</p></div>
          ) : (
            <div className="space-y-4">
              {overdue.map((loc) => (
                <div key={loc.id} className="bg-white shadow-sm rounded-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-accent-dark">{loc.prenom} {loc.nom}</h3>
                      <p className="text-sm text-accent-slate">Contrat: {loc.contrat_reference}</p>
                      <p className="text-sm text-accent-slate">Email: {loc.email} | Tel: {loc.telephone}</p>
                      <p className="text-sm text-accent-red mt-2">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {loc.nb_echeances_retard} échéance(s) en retard - {loc.montant_retard} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <DollarSign className="h-8 w-8 text-primary-700 mb-2" />
              <p className="text-sm text-accent-slate">Total paiements</p>
              <p className="text-2xl font-extrabold text-accent-dark">{stats.paiements?.total_montant || 0} FCFA</p>
              <p className="text-sm text-accent-slate">{stats.paiements?.total_paiements || 0} paiements</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6">
              <TrendingUp className="h-8 w-8 text-secondary-600 mb-2" />
              <p className="text-sm text-accent-slate">Total ce mois</p>
              <p className="text-2xl font-extrabold text-accent-dark">{stats.total_this_month || 0} FCFA</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6">
              <FileText className="h-8 w-8 text-primary-700 mb-2" />
              <p className="text-sm text-accent-slate">Locataires</p>
              <p className="text-2xl font-extrabold text-accent-dark">{stats.paiements?.total_locataires || 0}</p>
            </div>
            {stats.echeances && (
              <div className="bg-white shadow-sm rounded-lg p-6 md:col-span-3">
                <h3 className="text-sm font-semibold text-accent-slate mb-3">Échéances par statut</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.echeances.map((e) => (
                    <div key={e.statut} className="bg-accent-lighter rounded p-3">
                      <p className="text-sm text-accent-slate">{e.statut}</p>
                      <p className="text-lg font-semibold">{e.count}</p>
                      <p className="text-xs text-accent-slate">{e.total || 0} FCFA</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Enregistrer un paiement</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleRecord} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">ID Contrat *</label>
                  <input type="number" required value={formData.contrat_id} onChange={(e) => setFormData({...formData, contrat_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">ID Locataire *</label>
                  <input type="number" required value={formData.locataire_id} onChange={(e) => setFormData({...formData, locataire_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Montant (FCFA) *</label>
                <input type="number" step="0.01" required value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Mode de paiement</label>
                <select value={formData.mode_paiement} onChange={(e) => setFormData({...formData, mode_paiement: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500">
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">ID Échéance</label>
                  <input type="number" value={formData.echeance_id} onChange={(e) => setFormData({...formData, echeance_id: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Période (MM/YYYY)</label>
                  <input type="text" placeholder="ex: 01/2026" value={formData.periode} onChange={(e) => setFormData({...formData, periode: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Commentaire</label>
                <textarea rows={2} value={formData.commentaire} onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
