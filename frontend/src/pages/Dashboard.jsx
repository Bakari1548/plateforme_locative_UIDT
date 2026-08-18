import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { api, getCurrentUser } from '../lib/api'
import {
  FileText, Building2, DollarSign, AlertTriangle,
  ShieldCheck, Gavel, TrendingUp, Clock,
  ArrowRight, CheckSquare, Wrench, ShieldCheck as Shield, Users, Plus
} from 'lucide-react'
import { DonutChart, HBarChart, BarChart, StatCard } from '../components/Charts'
import { Link } from 'react-router-dom'

function ChartCard({ title, subtitle, accent = '#1e3a5f', children }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <div className="p-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-accent-dark">{title}</h3>
          {subtitle && <p className="text-xs text-accent-slate mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  brouillon: '#9ca3af', soumis: '#3b82f6', en_instruction: '#f59e0b',
  recevable: '#10b981', incomplet: '#f97316', rejete: '#ef4444',
  en_commission: '#8b5cf6', attribue: '#059669', non_attribue: '#dc2626',
  actif: '#059669', signe: '#3b82f6', en_attente_signature: '#f59e0b',
  en_validation_directeur: '#8b5cf6', resilie: '#ef4444', expire: '#9ca3af',
  disponible: '#10b981', occupe: '#3b82f6', en_maintenance: '#f59e0b',
  reserve: '#8b5cf6', inactif: '#9ca3af',
  signale: '#3b82f6', en_attente: '#f59e0b', planifie: '#8b5cf6', en_cours: '#f59e0b', termine: '#10b981', resolu: '#10b981', ferme: '#9ca3af', prise_en_charge: '#8b5cf6',
  paye: '#10b981', retard: '#ef4444', partiel: '#f97316',
}

const STATUS_LABELS = {
  brouillon: 'Brouillon', soumis: 'Soumis', en_instruction: 'En instruction',
  recevable: 'Recevable', incomplet: 'Incomplet', rejete: 'Rejeté',
  en_commission: 'En commission', attribue: 'Attribué', non_attribue: 'Non attribué',
  actif: 'Actif', signe: 'Signé', en_attente_signature: 'En attente signature',
  en_validation_directeur: 'En validation Directeur', resilie: 'Résilié', expire: 'Expiré',
  disponible: 'Disponible', occupe: 'Occupé', en_maintenance: 'En maintenance',
  reserve: 'Réservé', inactif: 'Inactif',
  signale: 'Signalé', en_attente: 'En attente', planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé', resolu: 'Résolu', ferme: 'Fermé', prise_en_charge: 'Pris en charge',
  paye: 'Payé', retard: 'En retard', partiel: 'Partiel',
}

function statsToChartData(stats) {
  if (!Array.isArray(stats)) return []
  return stats.map(s => ({
    label: STATUS_LABELS[s.statut] || s.statut,
    value: parseInt(s.count),
    color: STATUS_COLORS[s.statut] || '#9ca3af'
  })).filter(d => d.value > 0)
}

function arrayToChartData(items, key) {
  if (!Array.isArray(items)) return []
  const groups = {}
  items.forEach(item => {
    const v = item[key]
    groups[v] = (groups[v] || 0) + 1
  })
  return Object.entries(groups).map(([statut, count]) => ({
    label: STATUS_LABELS[statut] || statut,
    value: count,
    color: STATUS_COLORS[statut] || '#9ca3af'
  }))
}

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

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'visiteur') return <Navigate to="/demandes/nouveau" replace />

  const isStaff = ['admin', 'dcuv', 'directeur'].includes(user.role)
  const isLocataire = user.role === 'locataire'
  const isTechnicien = user.role === 'technicien'
  const isDirecteur = user.role === 'directeur'
  const isDCUV = user.role === 'dcuv'
  const isAdmin = user.role === 'admin'

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Tableau de bord</h1>
      <p className="text-sm text-accent-slate mb-6">Bienvenue, {user.prenom} {user.nom}</p>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>}

      {loading ? (
        <div className="bg-white shadow-sm rounded-xl p-8 text-center text-accent-slate">Chargement...</div>
      ) : data ? (
        <>
          {/* DCUV - 4 cartes spécifiques en haut */}
          {isDCUV && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={FileText} label="Total demandes" value={data.total_demandes ?? 0} color="text-blue-600" />
              <StatCard icon={FileText} label="Contrats signés" value={data.contrats_signes ?? 0} color="text-green-600" />
              <StatCard icon={Shield} label="Contrôles QHSE" value={data.total_controles_qhse ?? 0} color="text-amber-600" />
              <StatCard icon={Wrench} label="Interventions terminées" value={data.interventions_terminees ?? 0} color="text-purple-600" />
            </div>
          )}

          {/* Directeur - 4 cartes sur une ligne */}
          {isDirecteur && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={CheckSquare} label="Décisions prises" value={data.decisions_prises ?? 0} sublabel={`${data.decisions_en_attente ?? 0} en attente`} color="text-primary-700" />
              <StatCard icon={FileText} label="Contrats signés" value={data.contrats_signes ?? 0} sublabel={`${data.contrats_en_attente ?? 0} en attente`} color="text-green-600" />
              <StatCard icon={DollarSign} label="Paiements" value={`${data.paiements.total_montant || data.paiements.total_paiements || 0} FCFA`} sublabel={`${data.paiements.total_paiements || 0} paiements`} color="text-primary-700" />
              <StatCard icon={DollarSign} label="Recettes du mois" value={`${data.total_recettes_mois ?? 0} FCFA`} color="text-secondary-600" />
            </div>
          )}

          {/* Admin - 4 cartes sur une ligne + bouton ajouter local */}
          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Users} label="Total utilisateurs" value={data.total_users ?? 0} color="text-primary-700" />
              <StatCard icon={Building2} label="Total locaux" value={data.total_locaux ?? 0} color="text-purple-600" />
              <StatCard icon={FileText} label="Total demandes" value={data.demandes?.total ?? (Array.isArray(data.demandes) ? data.demandes.length : 0)} color="text-blue-600" />
              <StatCard icon={DollarSign} label="Recettes du mois" value={`${data.total_recettes_mois ?? 0} FCFA`} color="text-secondary-600" />
            </div>
          )}

          {/* Admin - Quick access */}
          {isAdmin && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-accent-slate uppercase tracking-wide mb-3">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/dcuv/locaux" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-primary-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Ajouter un local</p>
                    <p className="text-sm text-accent-slate">Créer un nouveau local</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/admin/users" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-secondary-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary-50 group-hover:bg-secondary-100 transition-colors flex items-center justify-center">
                    <Users className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Gérer les utilisateurs</p>
                    <p className="text-sm text-accent-slate">Comptes et rôles</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-secondary-600 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/dcuv/contrats" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-green-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Gérer les contrats</p>
                    <p className="text-sm text-accent-slate">Contrats en cours</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {data.demandes && !Array.isArray(data.demandes) && (
              <StatCard icon={FileText} label="Demandes" value={data.demandes.total || 0} />
            )}
            {data.contrats && !Array.isArray(data.contrats) && (
              <StatCard icon={Building2} label="Contrats" value={data.contrats.total || 0} />
            )}
            {data.locaux && !Array.isArray(data.locaux) && (
              <StatCard icon={Building2} label="Locaux" value={data.locaux.total || 0} />
            )}
            {data.paiements && !Array.isArray(data.paiements) && !isDirecteur && !isAdmin && (
              <StatCard icon={DollarSign} label="Paiements" value={`${data.paiements.total_montant || data.paiements.total_paiements || 0} FCFA`} sublabel={`${data.paiements.total_paiements || 0} paiements`} color="text-primary-700" />
            )}
            {data.pending_demandes !== undefined && (
              <StatCard icon={Clock} label="Demandes en attente" value={data.pending_demandes} color="text-accent-orange" />
            )}
            {data.pending_contrats !== undefined && (
              <StatCard icon={FileText} label="Contrats en attente" value={data.pending_contrats} />
            )}
            {data.total_recettes_mois !== undefined && !isDirecteur && !isAdmin && (
              <StatCard icon={TrendingUp} label="Recettes du mois" value={`${data.total_recettes_mois} FCFA`} color="text-secondary-600" />
            )}
            {data.total_this_month !== undefined && (
              <StatCard icon={DollarSign} label="Recettes ce mois" value={`${data.total_this_month} FCFA`} />
            )}
            {data.notifications_unread !== undefined && data.notifications_unread > 0 && (
              <StatCard icon={AlertTriangle} label="Notifications non lues" value={data.notifications_unread} color="text-accent-orange" />
            )}
          </div>

          {/* Quick access - Directeur */}
          {isDirecteur && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-accent-slate uppercase tracking-wide mb-3">Accès rapide</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/directeur" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-primary-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors flex items-center justify-center">
                    <CheckSquare className="h-6 w-6 text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Validation des décisions</p>
                    <p className="text-sm text-accent-slate">Approuver ou rejeter les demandes</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/dcuv/contrats" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-secondary-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary-50 group-hover:bg-secondary-100 transition-colors flex items-center justify-center">
                    <FileText className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Gestion des contrats</p>
                    <p className="text-sm text-accent-slate">Contrats en attente de validation</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-secondary-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          )}

          {/* Charts section - Staff dashboards */}
          {isStaff && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {data.demandes && Array.isArray(data.demandes) && data.demandes.length > 0 && (
                <ChartCard title="Répartition des demandes" subtitle="Par statut" accent="#3b82f6">
                  <DonutChart data={statsToChartData(data.demandes)} />
                </ChartCard>
              )}
              {data.contrats && Array.isArray(data.contrats) && data.contrats.length > 0 && (
                <ChartCard title="Statut des contrats" subtitle="En cours, signés, résiliés" accent="#059669">
                  <DonutChart data={statsToChartData(data.contrats)} />
                </ChartCard>
              )}
              {data.locaux && Array.isArray(data.locaux) && data.locaux.length > 0 && (
                <ChartCard title="Occupation des locaux" subtitle="Disponibles vs occupés" accent="#8b5cf6">
                  <DonutChart data={statsToChartData(data.locaux)} />
                </ChartCard>
              )}
              {/* Diagramme évolution des paiements - Directeur & Admin */}
              {data.paiement_evolution && data.paiement_evolution.length > 0 && (
                <ChartCard title="Évolution des paiements" subtitle="6 derniers mois (FCFA)" accent="#059669">
                  <BarChart
                    data={data.paiement_evolution.map(p => ({
                      label: p.mois_court,
                      value: Math.round(p.total),
                      color: '#059669'
                    }))}
                    height={240}
                  />
                </ChartCard>
              )}
              {/* Incidents & Sanctions - DCUV uniquement, pas Directeur */}
              {!isDirecteur && data.incidents && Array.isArray(data.incidents) && data.incidents.length > 0 && (
                <ChartCard title="Incidents" subtitle="Par statut" accent="#ef4444">
                  <HBarChart data={statsToChartData(data.incidents)} />
                </ChartCard>
              )}
              {!isDirecteur && data.controles_qhse && Array.isArray(data.controles_qhse) && data.controles_qhse.length > 0 && (
                <ChartCard title="Contrôles QHSE" subtitle="Répartition par statut" accent="#f59e0b">
                  <HBarChart data={statsToChartData(data.controles_qhse)} />
                </ChartCard>
              )}
              {!isDirecteur && !isDCUV && data.sanctions && Array.isArray(data.sanctions) && data.sanctions.length > 0 && (
                <ChartCard title="Sanctions" subtitle="Par type" accent="#dc2626">
                  <HBarChart data={statsToChartData(data.sanctions)} />
                </ChartCard>
              )}
            </div>
          )}

          {/* Locataire - Accès rapide */}
          {isLocataire && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-accent-slate uppercase tracking-wide mb-3">Accès rapide</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/paiements" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-green-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Effectuer un paiement</p>
                    <p className="text-sm text-accent-slate">Régler mes échéances</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/incidents" className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center gap-4 border border-transparent hover:border-orange-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-accent-dark">Signaler un incident</p>
                    <p className="text-sm text-accent-slate">Déclarer un problème</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-light group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          )}

          {/* Locataire dashboard charts */}
          {isLocataire && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {data.incidents && Array.isArray(data.incidents) && data.incidents.length > 0 && (
                <ChartCard title="Mes incidents signalés" subtitle="Répartition par statut" accent="#ef4444">
                  <DonutChart data={arrayToChartData(data.incidents, 'statut')} />
                </ChartCard>
              )}
              {data.paiements && Array.isArray(data.paiements) && data.paiements.length > 0 && (
                <ChartCard title="Historique des paiements" subtitle="6 derniers paiements" accent="#059669">
                  <HBarChart data={data.paiements.slice(0, 6).map(p => ({
                    label: new Date(p.date_paiement).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
                    value: parseInt(p.montant) || 0,
                    color: '#059669'
                  }))} />
                </ChartCard>
              )}
            </div>
          )}

          {/* Technicien dashboard charts */}
          {isTechnicien && data.incidents && Array.isArray(data.incidents) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartCard title="Mes interventions" subtitle="Répartition par statut" accent="#f59e0b">
                <DonutChart data={arrayToChartData(data.incidents, 'statut')} />
              </ChartCard>
            </div>
          )}

          {/* Locataire specific lists */}
          {isLocataire && (
            <div className="mt-6 space-y-6">
              {data.demandes && Array.isArray(data.demandes) && data.demandes.length > 0 && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-lg font-bold text-accent-dark mb-3">Ma demande</h3>
                  <div className="space-y-2">
                    {data.demandes.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex justify-between items-center py-2 border-b border-accent-light last:border-0">
                        <span className="text-sm text-accent-dark">{d.numero_suivi || `Demande #${d.id}`}</span>
                        <span className="text-sm text-accent-slate">{d.statut}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.contrats && Array.isArray(data.contrats) && data.contrats.length > 0 && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-lg font-bold text-accent-dark mb-3">Mon contrat</h3>
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
              {data.controles_qhse && Array.isArray(data.controles_qhse) && data.controles_qhse.length > 0 && (
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-lg font-bold text-accent-dark mb-3">Contrôles QHSE de mon local</h3>
                  <div className="space-y-2">
                    {data.controles_qhse.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex justify-between items-center py-2 border-b border-accent-light last:border-0">
                        <div>
                          <span className="text-sm text-accent-dark font-medium">{c.reference || `Contrôle #${c.id}`}</span>
                          <span className="text-xs text-accent-slate ml-2">{c.local_reference || ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.score_global && <span className="text-xs font-bold text-accent-dark">{c.score_global}/100</span>}
                          <span className="text-sm text-accent-slate">{STATUS_LABELS[c.statut] || c.statut}</span>
                        </div>
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

