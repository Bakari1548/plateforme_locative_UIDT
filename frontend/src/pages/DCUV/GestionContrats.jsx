import { useState, useEffect, useRef } from 'react'
import { api, getCurrentUser } from '../../lib/api'
import { FileSignature, CheckCircle, Clock, FileText, X, Gavel, XCircle, Ban, Download, Send, Edit } from 'lucide-react'
import ContratTemplate from '../../components/ContratTemplate'

const STATUT_LABELS = {
  brouillon: 'Brouillon',
  en_validation_directeur: 'En validation Directeur',
  en_attente_signature: 'En attente signature',
  signe: 'Signé',
  actif: 'Actif',
  resilie: 'Résilié',
  expire: 'Expiré',
}

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-700',
  en_validation_directeur: 'bg-purple-100 text-purple-700',
  en_attente_signature: 'bg-yellow-100 text-yellow-700',
  signe: 'bg-blue-100 text-blue-700',
  actif: 'bg-green-100 text-green-700',
  resilie: 'bg-red-100 text-red-700',
  expire: 'bg-gray-100 text-gray-500',
}

export default function GestionContrats() {
  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('brouillons')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editContrat, setEditContrat] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [decisionContrat, setDecisionContrat] = useState(null)
  const [decisionCommentaire, setDecisionCommentaire] = useState('')
  const [pdfContrat, setPdfContrat] = useState(null)
  const [locauxDispo, setLocauxDispo] = useState([])
  const pdfRef = useRef(null)
  const user = getCurrentUser()
  const isDirecteur = user?.role === 'directeur'

  useEffect(() => { loadContrats() }, [tab])
  useEffect(() => { api.locaux.available().then(r => { if (!r.error) setLocauxDispo(r.locaux || []) }) }, [])

  async function loadContrats() {
    setLoading(true)
    setError('')
    let result
    if (tab === 'brouillons') {
      result = await api.contrats.brouillons()
    } else if (tab === 'pending') {
      result = await api.contrats.pendingDirecteurValidation()
    } else if (tab === 'active') {
      result = await api.contrats.active()
    } else {
      result = await api.contrats.list()
    }
    if (result.error) { setError(result.error) } else { setContrats(result.contrats || []) }
    setLoading(false)
  }

  async function handleUpdateContrat(e) {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    const result = await api.contrats.update(editContrat.id, editForm)
    if (result.error) { setError(result.error) } else {
      setEditContrat(null)
      loadContrats()
    }
    setActionLoading(false)
  }

  async function handleSendToDirecteur(contratId) {
    setActionLoading(true)
    setError('')
    const result = await api.contrats.sendToDirecteur(contratId)
    if (result.error) { setError(result.error) } else { loadContrats() }
    setActionLoading(false)
  }

  function openEdit(c) {
    setEditContrat(c)
    setEditForm({
      local_id: c.local_id || '',
      date_debut: c.date_debut || '',
      date_fin: c.date_fin || '',
      montant_loyer: c.montant_loyer || '',
      periodicite: c.periodicite || 'mensuel',
      caution: c.caution || '',
      conditions_particulieres: c.conditions_particulieres || '',
    })
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

  async function handleContratDecision(contratId, decision) {
    setActionLoading(true)
    setError('')
    const result = await api.contrats.validateDirecteur(contratId, decision, decisionCommentaire || null)
    if (result.error) {
      setError(result.error)
    } else {
      setDecisionContrat(null)
      setDecisionCommentaire('')
      loadContrats()
    }
    setActionLoading(false)
  }

  async function handleResilier(contratId) {
    const motif = prompt('Motif de la résiliation du contrat:')
    if (!motif) return
    setActionLoading(true)
    setError('')
    const result = await api.contrats.resiliate(contratId, motif)
    if (result.error) {
      setError(result.error)
    } else {
      setSelected(null)
      loadContrats()
    }
    setActionLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Gestion des contrats</h1>
      <p className="text-sm text-accent-slate mb-6">Révision et suivi des contrats</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="mb-6 flex gap-2">
        {(isDirecteur
          ? [{ key: 'pending', label: 'En attente' }, { key: 'active', label: 'Actifs' }, { key: 'all', label: 'Tous' }]
          : [{ key: 'brouillons', label: 'Brouillons' }, { key: 'pending', label: 'En attente' }, { key: 'active', label: 'Actifs' }, { key: 'all', label: 'Tous' }]
        ).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-primary-700 text-white' : 'bg-white text-accent-slate border border-accent-light'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : contrats.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <FileSignature className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucun contrat trouvé</p>
          {tab === 'brouillons' && <p className="text-sm text-accent-slate mt-2">Les contrats brouillons apparaissent ici automatiquement après attribution d'une demande.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {contrats.map((c) => (
            <div key={c.id} className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-accent-dark">{c.reference}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || STATUT_COLORS.brouillon}`}>
                      {STATUT_LABELS[c.statut] || c.statut}
                    </span>
                  </div>
                  <div className="text-sm text-accent-slate space-y-1">
                    <p><span className="font-medium">Locataire:</span> {c.prenom} {c.nom}</p>
                    <p><span className="font-medium">N° suivi:</span> {c.numero_suivi}</p>
                    {c.local_reference && <p><span className="font-medium">Local:</span> {c.local_reference} — {c.zone || 'N/A'}</p>}
                    {c.montant_loyer && <p><span className="font-medium">Loyer:</span> {Number(c.montant_loyer).toLocaleString('fr-FR')} FCFA / {c.periodicite}</p>}
                    {c.date_debut && <p><span className="font-medium">Date début:</span> {new Date(c.date_debut).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {!isDirecteur && c.statut === 'brouillon' && (
                    <>
                      <button onClick={() => openEdit(c)} disabled={actionLoading}
                        className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-1">
                        <Edit className="h-4 w-4" /> Réviser
                      </button>
                      <button onClick={() => handleSendToDirecteur(c.id)} disabled={actionLoading}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1">
                        <Send className="h-4 w-4" /> Envoyer au Directeur
                      </button>
                    </>
                  )}
                  {isDirecteur && c.statut === 'en_validation_directeur' && (
                    <button onClick={() => { setDecisionContrat(c); setDecisionCommentaire('') }} disabled={actionLoading}
                      className="px-3 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-1">
                      <Gavel className="h-4 w-4" /> Décider
                    </button>
                  )}
                  {!isDirecteur && (c.statut === 'actif' || c.statut === 'signe') && (
                    <button onClick={() => handleResilier(c.id)} disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1">
                      <Ban className="h-4 w-4" /> Résilier
                    </button>
                  )}
                  <button onClick={() => setPdfContrat(c)}
                    className="px-3 py-1.5 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter flex items-center gap-1">
                    <Download className="h-4 w-4" /> PDF
                  </button>
                  <button onClick={() => setSelected(c)}
                    className="px-3 py-1.5 text-accent-slate text-sm border border-accent-light rounded-lg hover:bg-accent-lighter">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal for DCUV */}
      {editContrat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Réviser: {editContrat.reference}</h2>
              <button onClick={() => setEditContrat(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <form onSubmit={handleUpdateContrat} className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate bg-accent-lighter p-3 rounded-lg">
                <p><span className="font-medium">Locataire:</span> {editContrat.prenom} {editContrat.nom}</p>
                <p><span className="font-medium">Demande:</span> {editContrat.numero_suivi}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Local à attribuer *</label>
                <select required value={editForm.local_id}
                  onChange={(e) => setEditForm({...editForm, local_id: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2">
                  <option value="">Sélectionner un local disponible</option>
                  {locauxDispo.map(l => (
                    <option key={l.id} value={l.id}>{l.reference} — {l.zone || 'N/A'} ({l.surface} m², {Number(l.loyer_mensuel).toLocaleString('fr-FR')} FCFA)</option>
                  ))}
                  {editContrat.local_id && !locauxDispo.find(l => l.id == editContrat.local_id) && (
                    <option value={editContrat.local_id}>{editContrat.local_reference} — {editContrat.zone} (déjà assigné)</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date début *</label>
                  <input type="date" required value={editForm.date_debut}
                    onChange={(e) => setEditForm({...editForm, date_debut: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Date fin</label>
                  <input type="date" value={editForm.date_fin}
                    onChange={(e) => setEditForm({...editForm, date_fin: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Loyer (FCFA)</label>
                  <input type="number" step="0.01" value={editForm.montant_loyer}
                    onChange={(e) => setEditForm({...editForm, montant_loyer: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-slate">Caution (FCFA)</label>
                  <input type="number" step="0.01" value={editForm.caution}
                    onChange={(e) => setEditForm({...editForm, caution: e.target.value})}
                    className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Périodicité</label>
                <select value={editForm.periodicite}
                  onChange={(e) => setEditForm({...editForm, periodicite: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2">
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Conditions particulières</label>
                <textarea rows={3} value={editForm.conditions_particulieres}
                  onChange={(e) => setEditForm({...editForm, conditions_particulieres: e.target.value})}
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditContrat(null)}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Annuler</button>
                <button type="submit" disabled={actionLoading}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50">
                  {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">{selected.reference}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm text-accent-slate">
              <p><span className="font-medium">Statut:</span> {STATUT_LABELS[selected.statut] || selected.statut}</p>
              <p><span className="font-medium">Locataire:</span> {selected.prenom} {selected.nom}</p>
              <p><span className="font-medium">N° suivi:</span> {selected.numero_suivi}</p>
              {selected.local_reference && <p><span className="font-medium">Local:</span> {selected.local_reference} — {selected.zone}</p>}
              {selected.date_debut && <p><span className="font-medium">Date début:</span> {new Date(selected.date_debut).toLocaleDateString('fr-FR')}</p>}
              {selected.date_fin && <p><span className="font-medium">Date fin:</span> {new Date(selected.date_fin).toLocaleDateString('fr-FR')}</p>}
              {selected.montant_loyer && <p><span className="font-medium">Loyer:</span> {Number(selected.montant_loyer).toLocaleString('fr-FR')} FCFA / {selected.periodicite}</p>}
              {selected.caution > 0 && <p><span className="font-medium">Caution:</span> {Number(selected.caution).toLocaleString('fr-FR')} FCFA</p>}
              <p><span className="font-medium">Signé locataire:</span> {selected.signe_par_locataire ? 'Oui' : 'Non'}</p>
              {selected.conditions_particulieres && <p><span className="font-medium">Conditions:</span> {selected.conditions_particulieres}</p>}
              {selected.commentaire_directeur && (
                <p className="p-2 bg-orange-50 rounded"><span className="font-medium">Commentaire Directeur:</span> {selected.commentaire_directeur}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision modal for Directeur */}
      {decisionContrat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Décision: {decisionContrat.reference}</h2>
              <button onClick={() => setDecisionContrat(null)}><X className="h-5 w-5 text-accent-slate" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm text-accent-slate space-y-2">
                <p><span className="font-medium">Locataire:</span> {decisionContrat.prenom} {decisionContrat.nom}</p>
                <p><span className="font-medium">N° suivi:</span> {decisionContrat.numero_suivi}</p>
                {decisionContrat.local_reference && <p><span className="font-medium">Local:</span> {decisionContrat.local_reference} — {decisionContrat.zone}</p>}
                {decisionContrat.date_debut && <p><span className="font-medium">Date début:</span> {new Date(decisionContrat.date_debut).toLocaleDateString('fr-FR')}</p>}
                {decisionContrat.montant_loyer && <p><span className="font-medium">Loyer:</span> {Number(decisionContrat.montant_loyer).toLocaleString('fr-FR')} FCFA / {decisionContrat.periodicite}</p>}
                {decisionContrat.caution > 0 && <p><span className="font-medium">Caution:</span> {Number(decisionContrat.caution).toLocaleString('fr-FR')} FCFA</p>}
                {decisionContrat.conditions_particulieres && (
                  <p className="p-2 bg-accent-lighter rounded"><span className="font-medium">Conditions:</span> {decisionContrat.conditions_particulieres}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-slate">Commentaire (optionnel pour modification)</label>
                <textarea rows={3} value={decisionCommentaire}
                  onChange={(e) => setDecisionCommentaire(e.target.value)}
                  placeholder="Précisez les modifications à apporter..."
                  className="mt-1 block w-full border border-accent-light rounded-lg px-3 py-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleContratDecision(decisionContrat.id, 'approuve')} disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Approuver
                </button>
                <button onClick={() => handleContratDecision(decisionContrat.id, 'rejete')} disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Demander modification
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => { setDecisionContrat(null); setDecisionCommentaire('') }}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export modal */}
      {pdfContrat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-semibold">Aperçu du contrat: {pdfContrat.reference}</h2>
              <div className="flex gap-2">
                <button onClick={handleExportPDF}
                  className="px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-1">
                  <Download className="h-4 w-4" /> Télécharger PDF
                </button>
                <button onClick={() => setPdfContrat(null)}><X className="h-5 w-5 text-accent-slate" /></button>
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
