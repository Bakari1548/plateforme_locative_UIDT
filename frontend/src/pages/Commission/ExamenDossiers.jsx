import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Gavel, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

const AVIS_CONFIG = {
  favorable: { label: 'Favorable', color: 'bg-green-100 text-secondary-600' },
  defavorable: { label: 'Défavorable', color: 'bg-red-100 text-accent-red' },
  reserve: { label: 'Réservé', color: 'bg-yellow-100 text-yellow-700' }
}

export default function ExamenDossiers() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [avisForm, setAvisForm] = useState({ avis: '', avis_motive: '', recommandation: '' })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadCommissions()
  }, [tab])

  async function loadCommissions() {
    setLoading(true)
    setError('')
    let result
    if (tab === 'pending') {
      result = await api.commissions.list()
    } else {
      result = await api.commissions.avis()
    }
    if (result.error) {
      setError(result.error)
    } else {
      setCommissions(result.commissions || [])
    }
    setLoading(false)
  }

  async function handleEmitAvis(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.commissions.emitAvis(selected.id, avisForm)
    if (result.error) {
      setError(result.error)
    } else {
      setSelected(null)
      setAvisForm({ avis: '', avis_motive: '', recommandation: '' })
      loadCommissions()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Examen des dossiers</h1>
      <p className="text-sm text-accent-slate mb-6">Commissions et avis</p>

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
            Dossiers en cours
          </button>
          <button
            onClick={() => setTab('avis')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'avis' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
            }`}
          >
            Avis émis
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : commissions.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <Gavel className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucune commission à examiner</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((c) => (
              <div key={c.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-accent-dark">{c.numero_suivi}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.statut === 'planifiee' ? 'bg-blue-100 text-blue-700' :
                        c.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-700' :
                        c.statut === 'avis_emis' ? 'bg-green-100 text-secondary-600' :
                        'bg-accent-lighter text-accent-slate'
                      }`}>
                        {c.statut}
                      </span>
                      {c.avis && AVIS_CONFIG[c.avis] && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${AVIS_CONFIG[c.avis].color}`}>
                          Avis: {AVIS_CONFIG[c.avis].label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-accent-slate space-y-1">
                      <p><span className="font-medium">Type:</span> {c.type_local}</p>
                      <p><span className="font-medium">Motif:</span> {c.motif}</p>
                      <p><span className="font-medium">Locataire:</span> {c.prenom} {c.nom}</p>
                      <p><span className="font-medium">Date commission:</span> {new Date(c.date_commission).toLocaleDateString('fr-FR')}</p>
                      {c.avis_motive && (
                        <p className="mt-2 p-2 bg-accent-lighter rounded">
                          <span className="font-medium">Avis motivé:</span> {c.avis_motive}
                        </p>
                      )}
                      {c.recommandation && (
                        <p className="p-2 bg-accent-lighter rounded">
                          <span className="font-medium">Recommandation:</span> {c.recommandation}
                        </p>
                      )}
                    </div>
                  </div>
                  {c.statut !== 'avis_emis' && c.statut !== 'cloturee' && (
                    <button
                      onClick={() => { setSelected(c); setAvisForm({ avis: '', avis_motive: '', recommandation: '' }) }}
                      className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
                    >
                      Émettre avis
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Émettre un avis: {selected.numero_suivi}</h2>
            </div>
            <form onSubmit={handleEmitAvis} className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate space-y-1">
                <p><span className="font-medium">Type:</span> {selected.type_local}</p>
                <p><span className="font-medium">Motif:</span> {selected.motif}</p>
                <p><span className="font-medium">Locataire:</span> {selected.prenom} {selected.nom}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Avis *</label>
                <select
                  required
                  value={avisForm.avis}
                  onChange={(e) => setAvisForm({...avisForm, avis: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="favorable">Favorable</option>
                  <option value="defavorable">Défavorable</option>
                  <option value="reserve">Réservé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Avis motivé *</label>
                <textarea
                  required rows={4}
                  value={avisForm.avis_motive}
                  onChange={(e) => setAvisForm({...avisForm, avis_motive: e.target.value})}
                  placeholder="Justification de l'avis..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Recommandation</label>
                <textarea
                  rows={2}
                  value={avisForm.recommandation}
                  onChange={(e) => setAvisForm({...avisForm, recommandation: e.target.value})}
                  placeholder="Recommandations éventuelles..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
                >
                  {actionLoading ? 'Émission...' : 'Émettre avis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
