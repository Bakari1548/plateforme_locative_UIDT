import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { api, getCurrentUser } from '../lib/api'
import {
  FileText, Building2, DollarSign, AlertTriangle,
  ShieldCheck, Gavel, TrendingUp, CreditCard,
  CheckCircle, Clock
} from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getCurrentUser()

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    const result = await api.dashboard.get()
    if (result.error) { setError(result.error) }
    else { setData(result.dashboard) }
    setLoading(false)
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'visiteur') {
    return <Navigate to="/demandes/nouveau" replace />
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Tableau de bord</h1>
      <p className="text-sm text-accent-slate mb-6">Bienvenue, {user.prenom} {user.nom}</p>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center text-accent-slate">Chargement...</div>
        ) : data ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.demandes && (
                <StatCard icon={FileText} label="Demandes" data={data.demandes} />
              )}
              {data.contrats && (
                <StatCard icon={Building2} label="Contrats" data={data.contrats} />
              )}
              {data.locaux && (
                <StatCard icon={Building2} label="Locaux" data={data.locaux} />
              )}
              {data.paiements && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <DollarSign className="h-8 w-8 text-primary-700 mb-2" />
                  <p className="text-sm text-accent-slate">Paiements</p>
                  <p className="text-2xl font-bold text-accent-dark">{data.paiements.total_montant || 0} FCFA</p>
                  <p className="text-sm text-accent-slate">{data.paiements.total_paiements || 0} paiements</p>
                  {data.total_this_month !== undefined && (
                    <p className="text-sm text-secondary-600 mt-1">Ce mois: {data.total_this_month} FCFA</p>
                  )}
                </div>
              )}
              {data.incidents && Array.isArray(data.incidents) && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <AlertTriangle className="h-8 w-8 text-accent-orange mb-2" />
                  <p className="text-sm text-accent-slate">Incidents</p>
                  <p className="text-2xl font-bold text-accent-dark">{data.incidents.length}</p>
                  {data.pending_count !== undefined && (
                    <p className="text-sm text-accent-orange mt-1">{data.pending_count} en attente</p>
                  )}
                </div>
              )}
              {data.incidents && !Array.isArray(data.incidents) && (
                <StatCard icon={AlertTriangle} label="Incidents" data={data.incidents} />
              )}
              {data.controles_qhse && (
                <StatCard icon={ShieldCheck} label="Contrôles QHSE" data={data.controles_qhse} />
              )}
              {data.sanctions && Array.isArray(data.sanctions) && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <Gavel className="h-8 w-8 text-accent-red mb-2" />
                  <p className="text-sm text-accent-slate">Sanctions</p>
                  <p className="text-2xl font-bold text-accent-dark">{data.sanctions.length}</p>
                </div>
              )}
              {data.sanctions && !Array.isArray(data.sanctions) && (
                <StatCard icon={Gavel} label="Sanctions" data={data.sanctions} />
              )}
              {data.pending_demandes !== undefined && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <Clock className="h-8 w-8 text-accent-orange mb-2" />
                  <p className="text-sm text-accent-slate">Demandes en attente</p>
                  <p className="text-2xl font-bold text-accent-dark">{data.pending_demandes}</p>
                </div>
              )}
              {data.pending_contrats !== undefined && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <FileText className="h-8 w-8 text-primary-700 mb-2" />
                  <p className="text-sm text-accent-slate">Contrats en attente</p>
                  <p className="text-2xl font-bold text-accent-dark">{data.pending_contrats}</p>
                </div>
              )}
              {data.total_recettes_mois !== undefined && (
                <div className="bg-white shadow-sm rounded-xl p-6 md:col-span-3">
                  <TrendingUp className="h-8 w-8 text-secondary-500 mb-2" />
                  <p className="text-sm text-accent-slate">Recettes du mois</p>
                  <p className="text-3xl font-bold text-secondary-600">{data.total_recettes_mois} FCFA</p>
                </div>
              )}
            </div>

            {/* Locataire specific lists */}
            {user.role === 'locataire' && (
              <div className="mt-6 space-y-6">
                {data.demandes && Array.isArray(data.demandes) && data.demandes.length > 0 && (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-accent-dark mb-3">Mes demandes</h3>
                    <div className="space-y-2">
                      {data.demandes.slice(0, 5).map((d) => (
                        <div key={d.id} className="flex justify-between items-center py-2 border-b border-accent-light last:border-0">
                          <span className="text-sm text-accent-dark">{d.numero_demande || `Demande #${d.id}`}</span>
                          <span className="text-sm text-accent-slate">{d.statut}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.contrats && Array.isArray(data.contrats) && data.contrats.length > 0 && (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-accent-dark mb-3">Mes contrats</h3>
                    <div className="space-y-2">
                      {data.contrats.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex justify-between items-center py-2 border-b border-accent-light last:border-0">
                          <span className="text-sm text-accent-dark">{c.reference}</span>
                          <span className="text-sm text-accent-slate">{c.statut}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.paiements && Array.isArray(data.paiements) && data.paiements.length > 0 && (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-accent-dark mb-3">Mes paiements récents</h3>
                    <div className="space-y-2">
                      {data.paiements.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex justify-between items-center py-2 border-b border-accent-light last:border-0">
                          <span className="text-sm text-accent-dark">{p.montant} FCFA</span>
                          <span className="text-sm text-accent-slate">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center text-accent-slate">Aucune donnée disponible</div>
        )}
    </div>
  )
}

function StatCard({ icon: Icon, label, data }) {
  const total = data?.total || data?.count || (Array.isArray(data) ? data.length : 0)
  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <Icon className="h-8 w-8 text-primary-700 mb-2" />
      <p className="text-sm text-accent-slate">{label}</p>
      <p className="text-2xl font-bold text-accent-dark">{total}</p>
    </div>
  )
}

