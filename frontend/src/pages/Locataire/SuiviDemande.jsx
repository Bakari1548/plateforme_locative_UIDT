import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
  const [demande, setDemande] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadDemande() }, [])

  async function loadDemande() {
    setLoading(true)
    setError('')
    const result = await api.demandes.my()
    if (result.error) {
      setError(result.error)
    } else {
      const demandes = result.demandes || []
      setDemande(demandes.length > 0 ? demandes[0] : null)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Ma demande</h1>
        <p className="text-sm text-accent-slate mb-6">Détails de votre demande de location</p>
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Ma demande</h1>
        <p className="text-sm text-accent-slate mb-6">Détails de votre demande de location</p>
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      </div>
    )
  }

  if (!demande) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Ma demande</h1>
        <p className="text-sm text-accent-slate mb-6">Détails de votre demande de location</p>
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate mb-4">Vous n'avez pas encore de demande</p>
          <button
            onClick={() => navigate('/demandes/nouveau')}
            className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
          >
            Créer une demande
          </button>
        </div>
      </div>
    )
  }

  const config = STATUT_CONFIG[demande.statut] || STATUT_CONFIG.brouillon
  const Icon = config.icon
  const isAttribue = demande.statut === 'attribue'

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Ma demande</h1>
      <p className="text-sm text-accent-slate mb-6">Détails de votre demande de location</p>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg font-semibold text-accent-dark">{demande.numero_suivi}</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2 text-sm text-accent-slate">
            <p><span className="font-medium">Type de local:</span> {demande.type_local}</p>
            <p><span className="font-medium">Motif:</span> {demande.motif}</p>
            {demande.description && <p><span className="font-medium">Description:</span> {demande.description}</p>}
            <p><span className="font-medium">Créée le:</span> {new Date(demande.created_at).toLocaleDateString('fr-FR')}</p>
            <p><span className="font-medium">Statut:</span> {config.label}</p>
          </div>

          <div className="space-y-2 text-sm text-accent-slate">
            {demande.profession && <p><span className="font-medium">Profession:</span> {demande.profession}</p>}
            {demande.revenu_mensuel && <p><span className="font-medium">Revenu mensuel:</span> {demande.revenu_mensuel} FCFA</p>}
            {demande.nombre_personnes && <p><span className="font-medium">Nombre de personnes:</span> {demande.nombre_personnes}</p>}
          </div>
        </div>

        {demande.commentaire_instruction && (
          <div className="mb-4 p-3 bg-accent-lighter rounded-lg text-sm text-accent-slate">
            <p className="font-medium mb-1">Commentaire DCUV</p>
            <p>{demande.commentaire_instruction}</p>
          </div>
        )}

        {isAttribue && (
          <div className="border-t pt-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-secondary-600" />
                <p className="font-semibold text-secondary-600">Demande approuvée — Local attribué</p>
              </div>
              <p className="text-sm text-accent-slate">
                Félicitations ! Votre demande a été approuvée. Votre contrat est en cours de création.
                Vous pouvez consulter les détails dans la section <button onClick={() => navigate('/mon-contrat')} className="text-primary-700 underline font-medium">Mon contrat</button>.
              </p>
            </div>
          </div>
        )}

        {demande.statut === 'rejete' && (
          <div className="border-t pt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-accent-red" />
                <p className="font-semibold text-accent-red">Demande rejetée</p>
              </div>
              <p className="text-sm text-accent-slate">
                Votre demande a été rejetée. Vous pouvez créer une nouvelle demande.
              </p>
              <button
                onClick={() => navigate('/demandes/nouveau')}
                className="mt-3 px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800"
              >
                Créer une nouvelle demande
              </button>
            </div>
          </div>
        )}

        {(demande.statut === 'soumis' || demande.statut === 'en_instruction' || demande.statut === 'recevable' || demande.statut === 'en_commission') && (
          <div className="border-t pt-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-700" />
                <p className="text-sm text-yellow-700">Votre demande est en cours de traitement. Veuillez patienter.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
