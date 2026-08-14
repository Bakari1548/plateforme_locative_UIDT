import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { FileText, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const STATUT_CONFIG = {
  brouillon: { label: 'Brouillon', color: 'bg-accent-lighter text-accent-slate', icon: FileText },
  soumis: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: Clock },
  en_instruction: { label: 'En instruction', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  recevable: { label: 'Recevable', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  incomplet: { label: 'Incomplet', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-accent-red', icon: XCircle },
  en_commission: { label: 'En commission', color: 'bg-purple-100 text-purple-700', icon: Clock },
  attribue: { label: 'Attribué', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  non_attribue: { label: 'Non attribué', color: 'bg-red-100 text-accent-red', icon: XCircle }
}

export default function SuiviDemande() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchNumero, setSearchNumero] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadDemandes()
  }, [])

  async function loadDemandes() {
    setLoading(true)
    const result = await api.demandes.my()
    if (result.error) {
      setError(result.error)
    } else {
      setDemandes(result.demandes || [])
    }
    setLoading(false)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchNumero.trim()) {
      loadDemandes()
      return
    }
    setLoading(true)
    const result = await api.demandes.getByNumero(searchNumero)
    if (result.error) {
      setError(result.error)
      setDemandes([])
    } else {
      setDemandes([result.demande])
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Mes demandes</h1>
      <p className="text-sm text-accent-slate mb-6">Suivi de vos demandes de location</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-slate" />
            <input
              type="text"
              value={searchNumero}
              onChange={(e) => setSearchNumero(e.target.value)}
              placeholder="Rechercher par numéro de suivi (ex: DEM-2026-0001)"
              className="w-full pl-10 pr-4 py-2 border border-accent-light rounded-lg focus:outline-none focus:ring-primary-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-accent-dark text-white rounded-lg hover:bg-accent-slate">
            Rechercher
          </button>
        </form>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : demandes.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-accent-light mx-auto mb-3" />
            <p className="text-accent-slate mb-4">Aucune demande trouvée</p>
            <button
              onClick={() => navigate('/demandes/nouveau')}
              className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
            >
              Créer une demande
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.map((demande) => {
              const config = STATUT_CONFIG[demande.statut] || STATUT_CONFIG.brouillon
              const Icon = config.icon
              return <div key={demande.id} className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
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
                        <p><span className="font-medium">Créée le:</span> {new Date(demande.created_at).toLocaleDateString('fr-FR')}</p>
                        {demande.commentaire_instruction && (
                          <p className="mt-2 p-2 bg-accent-lighter rounded text-accent-slate">
                            <span className="font-medium">Commentaire DCUV:</span> {demande.commentaire_instruction}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            })}
          </div>
        )}
      </div>
  )
}
