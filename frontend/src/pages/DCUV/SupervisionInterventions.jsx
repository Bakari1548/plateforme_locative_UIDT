import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Wrench, Clock, CheckCircle, X, AlertCircle, UserCog, Eye } from 'lucide-react'

const STATUT_COLORS = {
  signale: 'bg-yellow-100 text-yellow-700',
  en_attente: 'bg-blue-100 text-blue-700',
  planifie: 'bg-purple-100 text-purple-700',
  en_cours: 'bg-orange-100 text-orange-700',
  termine: 'bg-green-100 text-secondary-600',
  resolu: 'bg-green-100 text-secondary-600',
  rejete: 'bg-red-100 text-accent-red',
}

const INTERVENTION_STATUT_COLORS = {
  planifiee: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-orange-100 text-orange-700',
  terminee: 'bg-green-100 text-secondary-600',
  annulee: 'bg-red-100 text-accent-red',
}

const URGENCE_COLORS = {
  critique: 'bg-red-100 text-accent-red',
  urgent: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  faible: 'bg-accent-lighter text-accent-slate',
}

export default function SupervisionInterventions() {
  const [incidents, setIncidents] = useState([])
  const [interventions, setInterventions] = useState([])
  const [techniciens, setTechniciens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('incidents')
  const [selected, setSelected] = useState(null)
  const [assignIncident, setAssignIncident] = useState(null)
  const [technicienId, setTechnicienId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadData() }, [tab])

  useEffect(() => {
    api.users.getByRole('technicien').then(r => {
      if (!r.error) setTechniciens(r.users || [])
    })
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    if (tab === 'incidents') {
      const result = await api.incidents.list()
      if (result.error) { setError(result.error) } else { setIncidents(result.incidents || []) }
    } else {
      const result = await api.interventions.all()
      if (result.error) { setError(result.error) } else { setInterventions(result.interventions || []) }
    }
    setLoading(false)
  }

  async function handleAssign(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.incidents.assign(assignIncident.id, technicienId)
    if (result.error) {
      setError(result.error)
    } else {
      setAssignIncident(null)
      setTechnicienId('')
      loadData()
    }
    setActionLoading(false)
  }

  async function handleValidate(id) {
    setActionLoading(true)
    setError('')
    const result = await api.incidents.validate(id, { prise_en_charge_crous: true })
    if (result.error) {
      setError(result.error)
    } else {
      loadData()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Supervision des interventions</h1>
      <p className="text-sm text-accent-slate mb-6">Gestion des incidents et suivi des interventions techniques</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('incidents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'incidents' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}
        >
          <AlertCircle className="h-4 w-4 inline mr-1" /> Incidents
        </button>
        <button
          onClick={() => setTab('interventions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'interventions' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}
        >
          <Wrench className="h-4 w-4 inline mr-1" /> Interventions
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : tab === 'incidents' ? (
        incidents.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucun incident signalé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <div key={inc.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-accent-dark">{inc.reference}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[inc.statut] || ''}`}>{inc.statut}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${URGENCE_COLORS[inc.urgence] || ''}`}>{inc.urgence}</span>
                    </div>
                    <div className="text-sm text-accent-slate space-y-1">
                      <p><span className="font-medium">Type:</span> {inc.type_incident}</p>
                      <p><span className="font-medium">Locataire:</span> {inc.prenom} {inc.nom}</p>
                      <p><span className="font-medium">Description:</span> {inc.description}</p>
                      {inc.local_reference && <p><span className="font-medium">Local:</span> {inc.local_reference}</p>}
                      {inc.technicien_id && <p><span className="font-medium">Technicien assigné:</span> {inc.technicien_prenom} {inc.technicien_nom}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {inc.statut === 'signale' && (
                      <button
                        onClick={() => handleValidate(inc.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" /> Valider
                      </button>
                    )}
                    {inc.statut === 'en_attente' && (
                      <button
                        onClick={() => setAssignIncident(inc)}
                        className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
                      >
                        <UserCog className="h-4 w-4 inline mr-1" /> Assigner
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(inc)}
                      className="px-3 py-1.5 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter"
                    >
                      <Eye className="h-4 w-4 inline mr-1" /> Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : interventions.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <Wrench className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucune intervention enregistrée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((intv) => (
            <div key={intv.id} className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-accent-dark">{intv.incident_reference}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${INTERVENTION_STATUT_COLORS[intv.statut] || ''}`}>{intv.statut}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${URGENCE_COLORS[intv.urgence] || ''}`}>{intv.urgence}</span>
                  </div>
                  <div className="text-sm text-accent-slate space-y-1">
                    <p><span className="font-medium">Type:</span> {intv.type_incident}</p>
                    <p><span className="font-medium">Technicien:</span> {intv.technicien_prenom} {intv.technicien_nom}</p>
                    <p><span className="font-medium">Locataire:</span> {intv.locataire_prenom} {intv.locataire_nom}</p>
                    {intv.local_reference && <p><span className="font-medium">Local:</span> {intv.local_reference}</p>}
                    <p><span className="font-medium">Date:</span> {new Date(intv.date_intervention).toLocaleDateString('fr-FR')}</p>
                    {intv.diagnostic && <p><span className="font-medium">Diagnostic:</span> {intv.diagnostic}</p>}
                    {intv.action_realisee && <p><span className="font-medium">Action:</span> {intv.action_realisee}</p>}
                    {intv.resultat && <p><span className="font-medium">Résultat:</span> {intv.resultat}</p>}
                    {intv.duree_minutes && <p><span className="font-medium">Durée:</span> {intv.duree_minutes} min</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident details modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">{selected.reference}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm text-accent-slate">
              <p><span className="font-medium">Statut:</span> {selected.statut}</p>
              <p><span className="font-medium">Urgence:</span> {selected.urgence}</p>
              <p><span className="font-medium">Type:</span> {selected.type_incident}</p>
              <p><span className="font-medium">Locataire:</span> {selected.prenom} {selected.nom}</p>
              <p><span className="font-medium">Description:</span> {selected.description}</p>
              {selected.local_reference && <p><span className="font-medium">Local:</span> {selected.local_reference}</p>}
              {selected.technicien_id && <p><span className="font-medium">Technicien:</span> {selected.technicien_prenom} {selected.technicien_nom}</p>}
              <p><span className="font-medium">Date signalement:</span> {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign technicien modal */}
      {assignIncident && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Assigner un technicien</h2>
              <button onClick={() => setAssignIncident(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleAssign} className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate">
                <p><span className="font-medium">Incident:</span> {assignIncident.reference}</p>
                <p><span className="font-medium">Type:</span> {assignIncident.type_incident}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Technicien *</label>
                <select
                  required
                  value={technicienId}
                  onChange={(e) => setTechnicienId(e.target.value)}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Sélectionner un technicien</option>
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>{t.prenom} {t.nom} — {t.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssignIncident(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Assignation...' : 'Assigner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
