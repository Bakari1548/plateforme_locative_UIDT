import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Wrench, Clock, CheckCircle, X, AlertCircle } from 'lucide-react'

const STATUT_COLORS = {
  planifiee: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-orange-100 text-orange-700',
  terminee: 'bg-green-100 text-secondary-600',
  annulee: 'bg-red-100 text-accent-red'
}

export default function TechnicienBoard() {
  const [incidents, setIncidents] = useState([])
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('incidents')
  const [selected, setSelected] = useState(null)
  const [completeForm, setCompleteForm] = useState({
    diagnostic: '', action_realisee: '', pieces_utilisees: '', duree_minutes: '', resultat: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    setLoading(true)
    setError('')
    if (tab === 'incidents') {
      const result = await api.incidents.pending()
      if (result.error) { setError(result.error) } else { setIncidents(result.incidents || []) }
    } else {
      const result = await api.interventions.my()
      if (result.error) { setError(result.error) } else { setInterventions(result.interventions || []) }
    }
    setLoading(false)
  }

  async function handleStartIntervention(incidentId) {
    setActionLoading(true)
    const result = await api.interventions.create({ incident_id: incidentId })
    if (result.error) { setError(result.error) }
    else { loadData() }
    setActionLoading(false)
  }

  async function handleComplete(e) {
    e.preventDefault()
    setActionLoading(true)
    const result = await api.interventions.complete(selected.id, completeForm)
    if (result.error) { setError(result.error) }
    else { setSelected(null); setCompleteForm({ diagnostic: '', action_realisee: '', pieces_utilisees: '', duree_minutes: '', resultat: '' }); loadData() }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Interventions techniques</h1>
      <p className="text-sm text-accent-slate mb-6">Tableau de bord technicien</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab('incidents')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'incidents' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Incidents à traiter
          </button>
          <button onClick={() => setTab('interventions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'interventions' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Mes interventions
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : tab === 'incidents' ? (
          incidents.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><Wrench className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucun incident à traiter</p></div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.id} className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-accent-dark">{inc.reference}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inc.urgence === 'critique' ? 'bg-red-100 text-accent-red' :
                          inc.urgence === 'urgent' ? 'bg-orange-100 text-orange-700' :
                          inc.urgence === 'normal' ? 'bg-blue-100 text-blue-700' :
                          'bg-accent-lighter text-accent-slate'
                        }`}>{inc.urgence}</span>
                      </div>
                      <div className="text-sm text-accent-slate space-y-1">
                        <p><span className="font-medium">Type:</span> {inc.type_incident}</p>
                        <p><span className="font-medium">Locataire:</span> {inc.prenom} {inc.nom}</p>
                        <p><span className="font-medium">Description:</span> {inc.description}</p>
                        {inc.local_reference && <p><span className="font-medium">Local:</span> {inc.local_reference}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleStartIntervention(inc.id)} disabled={actionLoading}
                      className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800">
                      Prendre en charge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          interventions.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><Clock className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucune intervention</p></div>
          ) : (
            <div className="space-y-4">
              {interventions.map((intv) => (
                <div key={intv.id} className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-accent-dark">{intv.incident_reference}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[intv.statut] || ''}`}>{intv.statut}</span>
                      </div>
                      <div className="text-sm text-accent-slate space-y-1">
                        <p><span className="font-medium">Type:</span> {intv.type_incident}</p>
                        <p><span className="font-medium">Description:</span> {intv.description}</p>
                        <p><span className="font-medium">Date:</span> {new Date(intv.date_intervention).toLocaleDateString('fr-FR')}</p>
                        {intv.diagnostic && <p><span className="font-medium">Diagnostic:</span> {intv.diagnostic}</p>}
                        {intv.action_realisee && <p><span className="font-medium">Action:</span> {intv.action_realisee}</p>}
                        {intv.resultat && <p><span className="font-medium">Résultat:</span> {intv.resultat}</p>}
                      </div>
                    </div>
                    {intv.statut !== 'terminee' && intv.statut !== 'annulee' && (
                      <button onClick={() => { setSelected(intv); setCompleteForm({ diagnostic: '', action_realisee: '', pieces_utilisees: '', duree_minutes: '', resultat: '' }) }}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Clôturer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Clôturer l'intervention</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleComplete} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Diagnostic</label>
                <textarea rows={3} value={completeForm.diagnostic} onChange={(e) => setCompleteForm({...completeForm, diagnostic: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Action réalisée</label>
                <textarea rows={3} value={completeForm.action_realisee} onChange={(e) => setCompleteForm({...completeForm, action_realisee: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Pièces utilisées</label>
                  <input type="text" value={completeForm.pieces_utilisees} onChange={(e) => setCompleteForm({...completeForm, pieces_utilisees: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Durée (minutes)</label>
                  <input type="number" value={completeForm.duree_minutes} onChange={(e) => setCompleteForm({...completeForm, duree_minutes: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Résultat</label>
                <textarea rows={2} value={completeForm.resultat} onChange={(e) => setCompleteForm({...completeForm, resultat: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {actionLoading ? 'Clôture...' : 'Clôturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
