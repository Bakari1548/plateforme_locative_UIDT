import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { CreditCard, FileText, Receipt } from 'lucide-react'

export default function MesPaiements() {
  const [paiements, setPaiements] = useState([])
  const [quittances, setQuittances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('paiements')

  useEffect(() => { loadData() }, [tab])

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
                </div>
              ))}
            </div>
          )
        )}
      </div>
  )
}
