import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { FileSignature, FileText, Download, Clock, CheckCircle, XCircle, Home, Euro, Eye, PenTool } from 'lucide-react'
import ContratTemplate from '../../components/ContratTemplate'

const STATUT_CONFIG = {
  brouillon: { label: 'Brouillon', color: 'bg-accent-lighter text-accent-slate', icon: FileText },
  en_validation_directeur: { label: 'En validation Directeur', color: 'bg-purple-100 text-purple-700', icon: Clock },
  en_attente_signature: { label: 'En attente signature', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  signe: { label: 'Signé', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  actif: { label: 'Actif', color: 'bg-green-100 text-secondary-600', icon: CheckCircle },
  resilie: { label: 'Résilié', color: 'bg-red-100 text-accent-red', icon: XCircle },
  expire: { label: 'Expiré', color: 'bg-accent-lighter text-accent-slate', icon: XCircle },
}

export default function MonContrat() {
  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfContrat, setPdfContrat] = useState(null)
  const pdfRef = useRef(null)

  useEffect(() => { loadContrats() }, [])

  async function loadContrats() {
    setLoading(true)
    setError('')
    const result = await api.contrats.my()
    if (result.error) { setError(result.error) } else { setContrats(result.contrats || []) }
    setLoading(false)
  }

  async function handleAccept(contratId) {
    setActionLoading(true)
    setError('')
    const result = await api.contrats.signLocataire(contratId)
    if (result.error) { setError(result.error) } else { loadContrats() }
    setActionLoading(false)
  }

  async function handleExportPDF() {
    if (!pdfRef.current) return
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `contrat_${pdfContrat.reference || pdfContrat.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }
    await html2pdf().set(opt).from(pdfRef.current).save()
    setPdfContrat(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Mon contrat</h1>
      <p className="text-sm text-accent-slate mb-6">Détails de votre contrat de location</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : contrats.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <FileSignature className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucun contrat trouvé</p>
          <p className="text-sm text-accent-slate mt-2">Votre contrat apparaîtra ici une fois créé et validé par le Directeur.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contrats.map((c) => {
            const config = STATUT_CONFIG[c.statut] || STATUT_CONFIG.brouillon
            const Icon = config.icon
            return (
              <div key={c.id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-semibold text-accent-dark">{c.reference}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-accent-slate">
                      <Home className="h-4 w-4 text-primary-700" />
                      <span className="font-medium">Local:</span> {c.local_reference || 'Non assigné'}
                    </div>
                    {c.zone && <p className="text-accent-slate ml-6">Zone: {c.zone}</p>}
                    {c.surface && <p className="text-accent-slate ml-6">Surface: {c.surface} m²</p>}
                    <div className="flex items-center gap-2 text-accent-slate">
                      <FileText className="h-4 w-4 text-primary-700" />
                      <span className="font-medium">N° suivi:</span> {c.numero_suivi}
                    </div>
                    <p className="text-accent-slate"><span className="font-medium">Type:</span> {c.type_local}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-accent-slate"><span className="font-medium">Date début:</span> {new Date(c.date_debut).toLocaleDateString('fr-FR')}</p>
                    {c.date_fin && <p className="text-accent-slate"><span className="font-medium">Date fin:</span> {new Date(c.date_fin).toLocaleDateString('fr-FR')}</p>}
                    {c.montant_loyer && (
                      <p className="text-accent-slate flex items-center gap-1">
                        <Euro className="h-4 w-4 text-primary-700" />
                        <span className="font-medium">Loyer:</span> {c.montant_loyer} FCFA / {c.periodicite}
                      </p>
                    )}
                    {c.caution > 0 && <p className="text-accent-slate"><span className="font-medium">Caution:</span> {c.caution} FCFA</p>}
                  </div>
                </div>

                {c.conditions_particulieres && (
                  <div className="mb-4 p-3 bg-accent-lighter rounded-lg text-sm text-accent-slate">
                    <p className="font-medium mb-1">Conditions particulières</p>
                    <p>{c.conditions_particulieres}</p>
                  </div>
                )}

                <div className="border-t pt-4 flex flex-wrap gap-2">
                  <button onClick={() => setPdfContrat(c)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter">
                    <Eye className="h-4 w-4" /> Voir le contrat
                  </button>
                  <button onClick={() => setPdfContrat(c)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800">
                    <Download className="h-4 w-4" /> Exporter PDF
                  </button>
                  {c.statut === 'en_attente_signature' && (
                    <button onClick={() => handleAccept(c.id)} disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                      <PenTool className="h-4 w-4" /> {actionLoading ? 'Acceptation...' : 'Accepter le contrat'}
                    </button>
                  )}
                </div>

                {c.statut === 'brouillon' && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    Votre contrat est en cours de préparation par la DCUV.
                  </div>
                )}
                {c.statut === 'en_validation_directeur' && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                    Votre contrat est en cours de validation par le Directeur. Vous pourrez l'accepter une fois approuvé.
                  </div>
                )}
                {c.statut === 'en_attente_signature' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    Votre contrat a été validé par le Directeur. Veuillez le lire et l'accepter pour l'activer.
                  </div>
                )}
                {c.statut === 'actif' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    Votre contrat est actif. Vous pouvez effectuer vos paiements dans la section « Mes paiements ».
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* PDF Export modal */}
      {pdfContrat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Contrat: {pdfContrat.reference}</h2>
              <div className="flex gap-2">
                <button onClick={handleExportPDF}
                  className="px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-1">
                  <Download className="h-4 w-4" /> Télécharger PDF
                </button>
                <button onClick={() => setPdfContrat(null)} className="text-accent-slate">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <ContratTemplate ref={pdfRef} contrat={pdfContrat} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
