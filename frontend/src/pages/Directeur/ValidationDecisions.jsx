import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Shield, CheckCircle, XCircle, Clock, FileText, Gavel, X } from 'lucide-react'

const STATUT_CONFIG = {
  recevable: { label: 'Recevable', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  attribue: { label: 'Approuvé', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  non_attribue: { label: 'Non attribué', color: 'bg-orange-100 text-orange-700', icon: XCircle },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-accent-red', icon: XCircle },
}

export default function ValidationDecisions() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('recevables')
  const [selected, setSelected] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [tab])

  async function loadData() {
    setLoading(true)
    setError('')
    let result
    if (tab === 'recevables') {
      result = await api.demandes.recevables()
    } else {
      result = await api.demandes.decided()
    }
    if (result.error) {
      setError(result.error)
    } else {
      setDemandes(result.demandes || [])
    }
    setLoading(false)
  }

  async function handleDecision(demandeId, statut) {
    setActionLoading(true)
    setError('')
    const result = await api.demandes.updateStatut(demandeId, statut, commentaire || null)
    if (result.error) {
      setError(result.error)
    } else {
      setSelected(null)
      setCommentaire('')
      loadData()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Validation des décisions</h1>
      <p className="text-sm text-accent-slate mb-6">Demandes recevables à approuver ou rejeter</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('recevables')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'recevables' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
          }`}
        >
          En attente de décision
        </button>
        <button
          onClick={() => setTab('decided')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'decided' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
          }`}
        >
          Décisions prises
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : demandes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <Gavel className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">
            {tab === 'recevables' ? 'Aucune demande en attente de décision' : 'Aucune décision prise'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map((d) => {
            const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.recevable
            const Icon = config.icon
            return (
              <div key={d.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-accent-dark">{d.numero_suivi}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                    <div className="text-sm text-accent-slate space-y-1">
                      <p><span className="font-medium">Demandeur:</span> {d.prenom} {d.nom}</p>
                      <p><span className="font-medium">Type:</span> {d.type_local}</p>
                      <p><span className="font-medium">Motif:</span> {d.motif}</p>
                      {d.description && <p><span className="font-medium">Description:</span> {d.description}</p>}
                      {d.commentaire_instruction && (
                        <p className="mt-2 p-2 bg-accent-lighter rounded">
                          <span className="font-medium">Commentaire DCUV:</span> {d.commentaire_instruction}
                        </p>
                      )}
                    </div>
                  </div>
                  {tab === 'recevables' && (
                    <button
                      onClick={() => { setSelected(d); setCommentaire('') }}
                      className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
                    >
                      Décider
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Decision modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Décision: {selected.numero_suivi}</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate space-y-2">
                <p><span className="font-medium">Demandeur:</span> {selected.prenom} {selected.nom}</p>
                <p><span className="font-medium">Type:</span> {selected.type_local}</p>
                <p><span className="font-medium">Motif:</span> {selected.motif}</p>
                <p><span className="font-medium">Description:</span> {selected.description || '-'}</p>
                {selected.commentaire_instruction && (
                  <p className="p-2 bg-accent-lighter rounded">
                    <span className="font-medium">Commentaire DCUV:</span> {selected.commentaire_instruction}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Commentaire (optionnel)</label>
                <textarea
                  rows={3}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Motif de la décision..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDecision(selected.id, 'attribue')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Approuver (Attribuer)
                </button>
                <button
                  onClick={() => handleDecision(selected.id, 'non_attribue')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                >
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Non attribué
                </button>
                <button
                  onClick={() => handleDecision(selected.id, 'rejete')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Rejeter
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setSelected(null); setCommentaire('') }}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
