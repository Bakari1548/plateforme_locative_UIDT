import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Shield, Calendar, FileText, X, CheckCircle, AlertTriangle, Clock, Gavel } from 'lucide-react'

const TYPE_LABELS = {
  periodique: 'Périodique',
  signalement: 'Signalement',
  fin_bail: 'Fin de bail',
  pre_affectation: 'Pré-affectation'
}

const STATUT_LABELS = {
  planifie: 'Planifié',
  en_cours: 'En cours',
  termine: 'Terminé',
  cloture: 'Clôturé'
}

const STATUT_COLORS = {
  planifie: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-yellow-100 text-yellow-700',
  termine: 'bg-green-100 text-secondary-600',
  cloture: 'bg-accent-lighter text-accent-slate'
}

const STATUT_ICONS = {
  planifie: Clock,
  en_cours: AlertTriangle,
  termine: CheckCircle,
  cloture: CheckCircle
}

const SANCTION_TYPE_LABELS = {
  avertissement: 'Avertissement',
  mise_en_demeure: 'Mise en demeure',
  penalite_financiere: 'Pénalité financière',
  resiliation_bail: 'Résiliation du bail',
  suspension: 'Suspension'
}

const SANCTION_STATUT_LABELS = {
  active: 'Active',
  levee: 'Levée',
  expiree: 'Expirée'
}

const SANCTION_STATUT_COLORS = {
  active: 'bg-red-100 text-red-700',
  levee: 'bg-green-100 text-secondary-600',
  expiree: 'bg-accent-lighter text-accent-slate'
}

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-accent-slate">{label}</span>
        <span className="text-xs font-bold text-accent-dark">{score}/100</span>
      </div>
      <div className="w-full bg-accent-lighter rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function MesControlesQHSE() {
  const [tab, setTab] = useState('qhse')
  const [controles, setControles] = useState([])
  const [sanctions, setSanctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedSanction, setSelectedSanction] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    setError('')
    const [ctrlRes, sanRes] = await Promise.all([
      api.controlesQhse.locataire(),
      api.sanctions.list()
    ])
    if (ctrlRes.error) { setError(ctrlRes.error) }
    else { setControles(ctrlRes.controles || []) }
    if (sanRes.error && !ctrlRes.error) { setError(sanRes.error) }
    else { setSanctions(sanRes.sanctions || []) }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Normes & Contrôles QHSE</h1>
      <p className="text-sm text-accent-slate mb-6">Contrôles qualité, hygiène, sécurité et environnement de votre local</p>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('qhse')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'qhse' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
          <Shield className="h-4 w-4 inline mr-1" /> Normes QHSE
        </button>
        <button onClick={() => setTab('sanctions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'sanctions' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
          <Gavel className="h-4 w-4 inline mr-1" /> Sanctions
          {sanctions.filter(s => s.statut === 'active').length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{sanctions.filter(s => s.statut === 'active').length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-xl p-8 text-center text-accent-slate">Chargement...</div>
      ) : tab === 'qhse' ? (
        controles.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center">
            <Shield className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucun contrôle QHSE pour votre local pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {controles.map((c) => {
              const StatutIcon = STATUT_ICONS[c.statut] || Clock
              return (
                <div key={c.id} className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition cursor-pointer" onClick={() => setSelected(c)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary-700" />
                      </div>
                      <div>
                        <p className="font-bold text-accent-dark">{c.reference || `Contrôle #${c.id}`}</p>
                        <p className="text-xs text-accent-slate">
                          Local: {c.local_reference || 'N/A'} | Type: {TYPE_LABELS[c.type_controle] || c.type_controle}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || ''} flex items-center gap-1`}>
                      <StatutIcon className="h-3 w-3" />
                      {STATUT_LABELS[c.statut] || c.statut}
                    </span>
                  </div>

                  {c.score_global > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <ScoreBar label="Propreté" score={c.score_proprete} color="bg-green-500" />
                      <ScoreBar label="Sécurité" score={c.score_securite} color="bg-blue-500" />
                      <ScoreBar label="Entretien" score={c.score_entretien} color="bg-amber-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-accent-slate">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.date_controle).toLocaleDateString('fr-FR')}
                    </span>
                    {c.score_global > 0 && (
                      <span className="font-bold text-accent-dark">Score global: {c.score_global}/100</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        sanctions.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center">
            <Gavel className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate">Aucune sanction à votre encontre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sanctions.map((s) => (
              <div key={s.id} className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition cursor-pointer" onClick={() => setSelectedSanction(s)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${s.statut === 'active' ? 'bg-red-50' : 'bg-accent-lighter'}`}>
                      <Gavel className={`h-5 w-5 ${s.statut === 'active' ? 'text-red-600' : 'text-accent-slate'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-accent-dark">{s.reference || `Sanction #${s.id}`}</p>
                      <p className="text-xs text-accent-slate">
                        Type: {SANCTION_TYPE_LABELS[s.type_sanction] || s.type_sanction}
                        {s.local_reference && ` | Local: ${s.local_reference}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${SANCTION_STATUT_COLORS[s.statut] || ''}`}>
                    {SANCTION_STATUT_LABELS[s.statut] || s.statut}
                  </span>
                </div>
                <p className="text-sm text-accent-dark line-clamp-2">{s.motif}</p>
                <div className="flex items-center justify-between text-xs text-accent-slate mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.date_sanction).toLocaleDateString('fr-FR')}
                  </span>
                  {s.date_debut && s.date_fin && (
                    <span>Du {new Date(s.date_debut).toLocaleDateString('fr-FR')} au {new Date(s.date_fin).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-700" />
                <h2 className="text-lg font-bold text-accent-dark">{selected.reference || `Contrôle #${selected.id}`}</h2>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[selected.statut] || ''}`}>
                  {STATUT_LABELS[selected.statut] || selected.statut}
                </span>
                <span className="text-xs text-accent-slate">
                  Type: {TYPE_LABELS[selected.type_controle] || selected.type_controle}
                </span>
              </div>

              <div className="text-sm text-accent-slate">
                <p><span className="font-semibold">Local:</span> {selected.local_reference || 'N/A'}</p>
                <p><span className="font-semibold">Date du contrôle:</span> {new Date(selected.date_controle).toLocaleString('fr-FR')}</p>
              </div>

              {selected.score_global > 0 && (
                <div className="space-y-3 p-4 bg-accent-lighter rounded-lg">
                  <p className="text-sm font-bold text-accent-dark">Scores</p>
                  <ScoreBar label="Propreté" score={selected.score_proprete} color="bg-green-500" />
                  <ScoreBar label="Sécurité" score={selected.score_securite} color="bg-blue-500" />
                  <ScoreBar label="Entretien" score={selected.score_entretien} color="bg-amber-500" />
                  <div className="pt-2 border-t border-accent-light">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-accent-dark">Score global</span>
                      <span className="text-lg font-bold text-primary-700">{selected.score_global}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {selected.observations && (
                <div>
                  <p className="text-sm font-semibold text-accent-slate mb-1">Observations</p>
                  <p className="text-sm text-accent-dark whitespace-pre-wrap p-3 bg-accent-lighter rounded">{selected.observations}</p>
                </div>
              )}

              {selected.recommandations && (
                <div>
                  <p className="text-sm font-semibold text-accent-slate mb-1">Recommandations</p>
                  <p className="text-sm text-accent-dark whitespace-pre-wrap p-3 bg-yellow-50 border border-yellow-200 rounded">{selected.recommandations}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {selectedSanction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedSanction(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-accent-dark">{selectedSanction.reference || `Sanction #${selectedSanction.id}`}</h2>
              </div>
              <button onClick={() => setSelectedSanction(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${SANCTION_STATUT_COLORS[selectedSanction.statut] || ''}`}>
                  {SANCTION_STATUT_LABELS[selectedSanction.statut] || selectedSanction.statut}
                </span>
                <span className="text-xs text-accent-slate">
                  Type: {SANCTION_TYPE_LABELS[selectedSanction.type_sanction] || selectedSanction.type_sanction}
                </span>
              </div>

              <div className="text-sm text-accent-slate space-y-1">
                <p><span className="font-semibold">Motif:</span> {selectedSanction.motif}</p>
                {selectedSanction.local_reference && <p><span className="font-semibold">Local:</span> {selectedSanction.local_reference}</p>}
                {selectedSanction.controle_reference && <p><span className="font-semibold">Contrôle QHSE:</span> {selectedSanction.controle_reference}</p>}
                <p><span className="font-semibold">Date de la sanction:</span> {new Date(selectedSanction.date_sanction).toLocaleDateString('fr-FR')}</p>
                {selectedSanction.date_debut && <p><span className="font-semibold">Date de début:</span> {new Date(selectedSanction.date_debut).toLocaleDateString('fr-FR')}</p>}
                {selectedSanction.date_fin && <p><span className="font-semibold">Date de fin:</span> {new Date(selectedSanction.date_fin).toLocaleDateString('fr-FR')}</p>}
              </div>

              {selectedSanction.description && (
                <div>
                  <p className="text-sm font-semibold text-accent-slate mb-1">Description</p>
                  <p className="text-sm text-accent-dark whitespace-pre-wrap p-3 bg-accent-lighter rounded">{selectedSanction.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setSelectedSanction(null)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
