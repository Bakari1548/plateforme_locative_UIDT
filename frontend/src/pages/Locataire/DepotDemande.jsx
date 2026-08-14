import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { FileText, Upload, Send, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'

const TYPES_LOCAL = [
  { value: 'cantine', label: 'Cantine' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'kiosque', label: 'Kiosque' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'autre', label: 'Autre' }
]

export default function DepotDemande() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    type_local: '',
    motif: '',
    description: ''
  })
  const [demandeId, setDemandeId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState({})
  const [uploadingType, setUploadingType] = useState(null)
  const navigate = useNavigate()

  const REQUIRED_DOCS = [
    { type: 'cni', label: "Carte Nationale d'Identité (CNI)" },
  ]

  useEffect(() => {
    if (demandeId && step === 2) {
      loadDocuments()
    }
  }, [demandeId, step])

  async function loadDocuments() {
    const result = await api.demandes.getDocuments(demandeId)
    if (!result.error && result.documents) {
      const docsMap = {}
      result.documents.forEach(doc => {
        docsMap[doc.type_document] = doc
      })
      setUploadedDocs(docsMap)
    }
  }

  async function handleFileUpload(e, docType) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingType(docType)
    setError('')

    const result = await api.demandes.uploadDocument(demandeId, file, docType)
    if (result.error) {
      setError(result.error)
    } else {
      setUploadedDocs(prev => ({ ...prev, [docType]: result.document }))
    }
    setUploadingType(null)
  }

  async function handleCreateDemande(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await api.demandes.create(formData)
    if (result.error) {
      setError(result.error)
    } else {
      setDemandeId(result.demande.id)
      setSuccess(result.message)
      setStep(2)
    }
    setLoading(false)
  }

  async function handleSubmitDemande() {
    setError('')
    setLoading(true)

    const result = await api.demandes.submit(demandeId)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Demande soumise avec succès ! Numéro de suivi: ' + result.demande.numero_suivi)
      setStep(3)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-accent-lighter">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/"><Logo variant="dark" size="sm" /></Link>
          <Link to="/demandes" className="inline-flex items-center gap-1 text-sm text-accent-slate hover:text-primary-700 transition">
            <ArrowLeft className="h-4 w-4" /> Mes demandes
          </Link>
        </div>
      </header>

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Nouvelle demande de location</h1>
          <p className="text-sm text-accent-slate mb-6">Dépôt d'une demande de local auprès du CROUS-T</p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? 'bg-primary-700 text-white' : 'bg-accent-light text-accent-slate'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 ${s < step ? 'bg-primary-700' : 'bg-accent-light'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-accent-slate">
            <span>Informations</span>
            <span>Documents</span>
            <span>Confirmation</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && step === 3 && (
          <div className="mb-4 bg-green-50 border border-green-200 text-secondary-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Step 1: Information form */}
        {step === 1 && (
          <form onSubmit={handleCreateDemande} className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-accent-slate">Type de local *</label>
              <select
                required
                value={formData.type_local}
                onChange={(e) => setFormData({...formData, type_local: e.target.value})}
                className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
              >
                <option value="">Sélectionner...</option>
                {TYPES_LOCAL.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-slate">Motif de la demande *</label>
              <input
                type="text" required
                value={formData.motif}
                onChange={(e) => setFormData({...formData, motif: e.target.value})}
                placeholder="Ex: Ouverture d'une cantine universitaire"
                className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-slate">Description détaillée</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez votre projet en détail..."
                className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Continuer'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Document upload (CNI) */}
        {step === 2 && (
          <div className="bg-white shadow-sm rounded-lg p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                <Upload className="h-8 w-8 text-primary-700" />
              </div>
              <h2 className="text-xl font-extrabold text-accent-dark mb-2">Téléversement de la CNI</h2>
              <p className="text-sm text-accent-slate">
                Veuillez fournir une copie lisible de votre Carte Nationale d'Identité
              </p>
            </div>

            {REQUIRED_DOCS.map((doc) => {
              const uploaded = uploadedDocs[doc.type]
              const isUploading = uploadingType === doc.type
              return (
                <div key={doc.type} className={`p-6 border-2 rounded-xl ${uploaded ? 'border-green-400 bg-green-50' : 'border-dashed border-primary-300 bg-primary-50/30'}`}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    {uploaded ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold">CNI téléversée avec succès</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-primary-700">
                        <FileText className="h-6 w-6" />
                        <span className="font-semibold">Aucun fichier sélectionné</span>
                      </div>
                    )}

                    {uploaded && (
                      <div className="text-sm text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                        {uploaded.nom_fichier} — {Math.round(uploaded.taille / 1024)} Ko
                      </div>
                    )}

                    <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer font-semibold text-sm transition ${
                      uploaded
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-primary-700 text-white hover:bg-primary-800'
                    }`}>
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Téléversement...
                        </span>
                      ) : uploaded ? (
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Remplacer le fichier
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Choisir un fichier
                        </span>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileUpload(e, doc.type)}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              )
            })}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm text-center">
              Formats acceptés: PDF, JPG, PNG, WebP — Taille maximale: 10 Mo
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </button>
              <button
                onClick={handleSubmitDemande}
                disabled={loading || !uploadedDocs['cni']}
                className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Soumission...' : 'Soumettre la demande'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Send className="h-8 w-8 text-secondary-600" />
            </div>
            <h2 className="text-xl font-extrabold text-accent-dark mb-2">Demande soumise !</h2>
            <p className="text-accent-slate mb-6">
              Votre demande a été soumise avec succès. Vous pouvez suivre son statut
              depuis votre tableau de bord.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/demandes')}
                className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
              >
                Suivre mes demandes
              </button>
              <button
                onClick={() => { setStep(1); setDemandeId(null); setFormData({type_local: '', motif: '', description: ''}); setSuccess('') }}
                className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter"
              >
                Nouvelle demande
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
