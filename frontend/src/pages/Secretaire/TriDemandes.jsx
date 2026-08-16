import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { ClipboardList, CheckCircle, XCircle, AlertCircle, Clock, FileText, Paperclip, Inbox } from 'lucide-react'

const STATUT_CONFIG = {
  soumis: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: Clock },
  en_instruction: { label: 'En instruction', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  recevable: { label: 'Recevable', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  incomplet: { label: 'Incomplet', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-accent-red', icon: XCircle },
  en_commission: { label: 'En commission', color: 'bg-purple-100 text-purple-700', icon: Clock },
  attribue: { label: 'Attribué', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  non_attribue: { label: 'Non attribué', color: 'bg-red-100 text-accent-red', icon: XCircle }
}

export default function TriDemandes() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)

  useEffect(() => { loadDemandes() }, [filter])

  async function loadDemandes() {
    setLoading(true)
    setError('')
    let result
    if (filter === 'pending') {
      result = await api.demandes.pending()
    } else {
      result = await api.demandes.list()
    }
    if (result.error) {
      setError(result.error)
    } else {
      setDemandes(result.demandes || [])
    }
    setLoading(false)
  }

  async function loadDocuments(demandeId) {
    setDocsLoading(true)
    const result = await api.demandes.getDocuments(demandeId)
    if (result.error) {
      setDocuments([])
    } else {
      setDocuments(result.documents || [])
    }
    setDocsLoading(false)
  }

  function handleSelectDemande(demande) {
    setSelectedDemande(demande)
    setCommentaire('')
    loadDocuments(demande.id)
  }

  async function handleStatutChange(demandeId, newStatut) {
    setActionLoading(true)
    setError('')
    const result = await api.demandes.updateStatut(demandeId, newStatut, commentaire || null)
    if (result.error) {
      setError(result.error)
    } else {
      setSelectedDemande(null)
      setCommentaire('')
      setDocuments([])
      loadDemandes()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Tri des demandes</h1>
      <p className="text-sm text-accent-slate mb-6">Vérification de la recevabilité des demandes soumises</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'pending' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
          }`}
        >
          En attente de tri
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'
          }`}
        >
          Toutes les demandes
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : demandes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <Inbox className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucune demande à trier</p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map((demande) => {
            const config = STATUT_CONFIG[demande.statut] || STATUT_CONFIG.soumis
            const Icon = config.icon
            return (
              <div key={demande.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-accent-dark">{demande.numero_suivi}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                    <div className="text-sm text-accent-slate space-y-1">
                      <p><span className="font-medium">Type:</span> {demande.type_local}</p>
                      <p><span className="font-medium">Motif:</span> {demande.motif}</p>
                      {demande.description && <p><span className="font-medium">Description:</span> {demande.description}</p>}
                      <p><span className="font-medium">Soumise le:</span> {demande.date_soumission ? new Date(demande.date_soumission).toLocaleDateString('fr-FR') : '-'}</p>
                      {demande.commentaire_instruction && (
                        <p className="mt-2 p-2 bg-accent-lighter rounded">
                          <span className="font-medium">Commentaire:</span> {demande.commentaire_instruction}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {demande.statut === 'soumis' && (
                      <button
                        onClick={() => handleSelectDemande(demande)}
                        className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
                      >
                        Trier
                      </button>
                    )}
                    <button
                      onClick={() => handleSelectDemande(demande)}
                      className="px-3 py-1.5 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tri modal */}
      {selectedDemande && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Tri: {selectedDemande.numero_suivi}</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate space-y-2">
                <p><span className="font-medium">Type:</span> {selectedDemande.type_local}</p>
                <p><span className="font-medium">Motif:</span> {selectedDemande.motif}</p>
                <p><span className="font-medium">Description:</span> {selectedDemande.description || '-'}</p>
                <p><span className="font-medium">Statut actuel:</span> {selectedDemande.statut}</p>
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-semibold text-accent-slate mb-2">
                  <Paperclip className="h-4 w-4 inline mr-1" />
                  Documents joints
                </label>
                {docsLoading ? (
                  <p className="text-sm text-accent-slate">Chargement des documents...</p>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-accent-slate">Aucun document</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-accent-lighter rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary-700" />
                          <div>
                            <p className="text-sm font-medium text-accent-dark">{doc.type_document === 'cni' ? 'Carte d\'identité (CNI)' : doc.type_document}</p>
                            <p className="text-xs text-accent-slate">{doc.nom_fichier}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url_fichier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-700 hover:underline"
                        >
                          Voir
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-slate">Commentaire / Demande de compléments</label>
                <textarea
                  rows={3}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Précisez les documents manquants ou les compléments nécessaires..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedDemande.statut === 'soumis' && (
                  <>
                    <button
                      onClick={() => handleStatutChange(selectedDemande.id, 'recevable')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Recevable (envoyer au DCUV)
                    </button>
                    <button
                      onClick={() => handleStatutChange(selectedDemande.id, 'incomplet')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                    >
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Incomplet (demander compléments)
                    </button>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setSelectedDemande(null); setCommentaire(''); setDocuments([]) }}
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
