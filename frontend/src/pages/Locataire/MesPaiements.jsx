import { useState, useEffect } from 'react'
import { api, getCurrentUser } from '../../lib/api'
import { CreditCard, FileText, Receipt, Plus, X, Smartphone, Banknote, CheckCircle, Loader, Download } from 'lucide-react'
import { generateQuittancePDF } from '../../lib/quittancePdf'

export default function MesPaiements() {
  const [paiements, setPaiements] = useState([])
  const [quittances, setQuittances] = useState([])
  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('paiements')
  const [showPayForm, setShowPayForm] = useState(false)
  const [payForm, setPayForm] = useState({ contrat_id: '', montant: '', mode_paiement: 'especes' })
  const [waveStep, setWaveStep] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(null)
  const user = getCurrentUser()

  useEffect(() => { loadData() }, [tab])

  useEffect(() => {
    api.contrats.my().then(r => { if (!r.error) setContrats(r.contrats || []) })
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    if (tab === 'paiements') {
      const result = await api.paiements.my()
      if (result.error) { setError(result.error) } else { setPaiements(result.paiements || []) }
    } else {
      const result = await api.quittances.my()
      if (result.error) { setError(result.error) } else { setQuittances(result.quittances || []) }
    }
    setLoading(false)
  }

  const activeContrats = contrats.filter(c => c.statut === 'actif' || c.statut === 'signe')

  async function handlePay(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')

    if (payForm.mode_paiement === 'mobile_money') {
      setWaveStep('processing')
      await new Promise(r => setTimeout(r, 2000))
      setWaveStep('confirming')
      await new Promise(r => setTimeout(r, 1500))
    }

    const result = await api.paiements.recordMy({
      ...payForm,
      locataire_id: user.id
    })

    if (result.error) {
      setError(result.error)
      setWaveStep(null)
    } else {
      setShowPayForm(false)
      setWaveStep(null)
      setPayForm({ contrat_id: '', montant: '', mode_paiement: 'especes' })
      loadData()
    }
    setActionLoading(false)
  }

  async function handleDownloadPDF(q) {
    setPdfLoading(q.id)
    const result = await api.quittances.get(q.paiement_id)
    if (result.error) {
      setError(result.error)
    } else {
      generateQuittancePDF(result.quittance)
    }
    setPdfLoading(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Mes paiements</h1>
      <p className="text-sm text-accent-slate mb-6">Historique des paiements et quittances</p>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab('paiements')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'paiements' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Historique paiements
          </button>
          <button onClick={() => setTab('quittances')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'quittances' ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            Mes quittances
          </button>
          {activeContrats.length > 0 && (
            <button onClick={() => setShowPayForm(true)} className="ml-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1">
              <Plus className="h-4 w-4" /> Effectuer un paiement
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
        ) : tab === 'paiements' ? (
          paiements.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><CreditCard className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucun paiement enregistré</p></div>
          ) : (
            <div className="space-y-3">
              {paiements.map((p) => (
                <div key={p.id} className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-accent-dark">{p.montant} FCFA</p>
                    <p className="text-sm text-accent-slate">{new Date(p.date_paiement).toLocaleDateString('fr-FR')} - {p.mode_paiement}</p>
                    <p className="text-xs text-accent-slate">Contrat: {p.contrat_reference} | Réf: {p.reference_recu}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-secondary-600">Payé</span>
                </div>
              ))}
            </div>
          )
        ) : (
          quittances.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center"><Receipt className="h-12 w-12 text-accent-light mx-auto mb-3" /><p className="text-accent-slate">Aucune quittance</p></div>
          ) : (
            <div className="space-y-3">
              {quittances.map((q) => (
                <div key={q.id} className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary-700" />
                    <div>
                      <p className="font-medium text-accent-dark">Quittance {q.reference}</p>
                      <p className="text-sm text-accent-slate">{q.periode} - {q.montant} FCFA</p>
                      <p className="text-xs text-accent-slate">Émise le {new Date(q.date_emission).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(q)}
                    disabled={pdfLoading === q.id}
                    className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {pdfLoading === q.id ? 'Chargement...' : 'PDF'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

      {/* Payment form modal */}
      {showPayForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Effectuer un paiement</h2>
              <button onClick={() => { setShowPayForm(false); setWaveStep(null) }}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>

            {waveStep ? (
              <div className="px-6 py-8 text-center">
                {waveStep === 'processing' && (
                  <>
                    <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="font-semibold text-accent-dark mb-1">Connexion à Wave...</p>
                    <p className="text-sm text-accent-slate">Initialisation du paiement mobile money</p>
                  </>
                )}
                {waveStep === 'confirming' && (
                  <>
                    <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="font-semibold text-accent-dark mb-1">Confirmation Wave</p>
                    <p className="text-sm text-accent-slate mb-4">Confirmez le paiement de {payForm.montant} FCFA sur votre téléphone</p>
                    <div className="flex items-center justify-center gap-2 text-secondary-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">Paiement confirmé</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handlePay} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Contrat *</label>
                  <select
                    required
                    value={payForm.contrat_id}
                    onChange={(e) => setPayForm({ ...payForm, contrat_id: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                  >
                    <option value="">Sélectionner un contrat</option>
                    {activeContrats.map(c => (
                      <option key={c.id} value={c.id}>{c.reference} — {c.local_reference || 'N/A'} ({c.montant_loyer} FCFA)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Montant (FCFA) *</label>
                  <input
                    type="number" required min="1"
                    value={payForm.montant}
                    onChange={(e) => setPayForm({ ...payForm, montant: e.target.value })}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-primary-500"
                    placeholder="Montant en FCFA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Mode de paiement *</label>
                  <div className="mt-2 space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${payForm.mode_paiement === 'especes' ? 'border-primary-700 bg-primary-50' : 'border-accent-light'}`}>
                      <input
                        type="radio"
                        value="especes"
                        checked={payForm.mode_paiement === 'especes'}
                        onChange={(e) => setPayForm({ ...payForm, mode_paiement: e.target.value })}
                        className="sr-only"
                      />
                      <Banknote className="h-5 w-5 text-accent-slate" />
                      <span className="text-sm font-medium text-accent-dark">Espèces</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${payForm.mode_paiement === 'mobile_money' ? 'border-primary-700 bg-primary-50' : 'border-accent-light'}`}>
                      <input
                        type="radio"
                        value="mobile_money"
                        checked={payForm.mode_paiement === 'mobile_money'}
                        onChange={(e) => setPayForm({ ...payForm, mode_paiement: e.target.value })}
                        className="sr-only"
                      />
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-sm font-medium text-accent-dark">Mobile Money (Wave)</span>
                        <p className="text-xs text-accent-slate">Paiement simulé via Wave</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowPayForm(false)} className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {actionLoading ? 'Traitement...' : 'Payer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
