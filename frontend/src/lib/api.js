const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, endpoint, data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const result = await response.json()
    return result
  } catch (err) {
    return { error: 'Erreur de connexion au serveur' }
  }
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  patch: (endpoint, data) => request('PATCH', endpoint, data),
  delete: (endpoint) => request('DELETE', endpoint),
  
  // Auth
  auth: {
    register: (data) => request('POST', '/auth/register', data),
    login: (data) => request('POST', '/auth/login', data),
    me: () => request('GET', '/auth/me')
  },
  
  // Users
  users: {
    list: () => request('GET', '/users'),
    get: (id) => request('GET', `/users/${id}`),
    create: (data) => request('POST', '/users', data),
    update: (id, data) => request('PUT', `/users/${id}`, data),
    delete: (id) => request('DELETE', `/users/${id}`),
    updateStatus: (id, status) => request('PATCH', `/users/${id}/status`, { status }),
    updateRole: (id, role) => request('PATCH', `/users/${id}/role`, { role }),
    search: (query) => request('GET', `/users/search/${query}`),
    getByRole: (role) => request('GET', `/users/role/${role}`)
  },
  
  // Demandes
  demandes: {
    create: (data) => request('POST', '/demandes', data),
    list: () => request('GET', '/demandes'),
    my: () => request('GET', '/demandes/my'),
    get: (id) => request('GET', `/demandes/${id}`),
    getByNumero: (numero) => request('GET', `/demandes/suivi/${numero}`),
    update: (id, data) => request('PUT', `/demandes/${id}`, data),
    submit: (id) => request('POST', `/demandes/${id}/submit`),
    updateStatut: (id, statut, commentaire = null) => 
      request('PATCH', `/demandes/${id}/statut`, { statut, commentaire }),
    pending: () => request('GET', '/demandes/pending'),
    dcuvInstruction: () => request('GET', '/demandes/dcuv-instruction'),
    recevables: () => request('GET', '/demandes/recevables'),
    decided: () => request('GET', '/demandes/decided'),
    stats: () => request('GET', '/demandes/stats'),
    uploadDocument: (id, file, typeDocument) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type_document', typeDocument)
      const token = getToken()
      return fetch(`${API_BASE}/demandes/${id}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      }).then(r => r.json()).catch(() => ({ error: 'Erreur de connexion au serveur' }))
    },
    getDocuments: (id) => request('GET', `/demandes/${id}/documents`),
  },
  
  // Commissions
  commissions: {
    create: (data) => request('POST', '/commissions', data),
    list: () => request('GET', '/commissions'),
    avis: () => request('GET', '/commissions/avis'),
    get: (id) => request('GET', `/commissions/${id}`),
    emitAvis: (id, data) => request('PATCH', `/commissions/${id}/avis`, data),
    updateStatut: (id, statut) => request('PATCH', `/commissions/${id}/statut`, { statut }),
    addMembre: (id, userId) => request('POST', `/commissions/${id}/membres`, { user_id: userId }),
    removeMembre: (id, userId) => request('DELETE', `/commissions/${id}/membres/${userId}`)
  },
  
  // Decisions
  decisions: {
    validatedWithoutContrat: () => request('GET', '/decisions/validated-without-contrat')
  },
  
  // Contrats
  contrats: {
    create: (data) => request('POST', '/contrats', data),
    createWithFile: (data, file) => {
      const formData = new FormData()
      Object.keys(data).forEach(key => formData.append(key, data[key]))
      formData.append('fichier_contrat', file)
      const token = getToken()
      return fetch(`${API_BASE}/contrats`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      }).then(r => r.json()).catch(() => ({ error: 'Erreur de connexion au serveur' }))
    },
    list: () => request('GET', '/contrats'),
    my: () => request('GET', '/contrats/my'),
    get: (id) => request('GET', `/contrats/${id}`),
    update: (id, data) => request('PUT', `/contrats/${id}`, data),
    sendForSignature: (id) => request('POST', `/contrats/${id}/send`),
    signLocataire: (id) => request('POST', `/contrats/${id}/sign/locataire`),
    signDcuv: (id) => request('POST', `/contrats/${id}/sign/dcuv`),
    resiliate: (id, motif) => request('POST', `/contrats/${id}/resilier`, { motif }),
    pending: () => request('GET', '/contrats/pending'),
    active: () => request('GET', '/contrats/active'),
    stats: () => request('GET', '/contrats/stats'),
    pendingDirecteurValidation: () => request('GET', '/contrats/pending-directeur-validation'),
    validateDirecteur: (id, decision, commentaire = null) => 
      request('PATCH', `/contrats/${id}/validate-directeur`, { decision, commentaire }),
    brouillons: () => request('GET', '/contrats/brouillons'),
    sendToDirecteur: (id) => request('POST', `/contrats/${id}/send-directeur`)
  },
  
  // Locaux
  locaux: {
    list: () => request('GET', '/locaux'),
    available: () => request('GET', '/locaux/available'),
    stats: () => request('GET', '/locaux/stats'),
    get: (id) => request('GET', `/locaux/${id}`),
    create: (data) => request('POST', '/locaux', data),
    update: (id, data) => request('PUT', `/locaux/${id}`, data),
    delete: (id) => request('DELETE', `/locaux/${id}`),
    updateStatut: (id, statut) => request('PATCH', `/locaux/${id}/statut`, { statut }),
    getByType: (type) => request('GET', `/locaux/type/${type}`),
    getByZone: (zone) => request('GET', `/locaux/zone/${zone}`),
    search: (query) => request('GET', `/locaux/search/${query}`),
    transferts: (id) => request('GET', `/locaux/${id}/transferts`)
  },
  
  // Transferts
  transferts: {
    create: (data) => request('POST', '/transferts', data),
    my: () => request('GET', '/transferts/my'),
    pending: () => request('GET', '/transferts/pending'),
    validate: (id, statut) => request('PATCH', `/transferts/${id}`, { statut })
  },
  
  // Paiements
  paiements: {
    list: () => request('GET', '/paiements'),
    my: () => request('GET', '/paiements/my'),
    recordMy: (data) => request('POST', '/paiements/my', data),
    stats: () => request('GET', '/paiements/stats'),
    overdue: () => request('GET', '/paiements/overdue'),
    get: (id) => request('GET', `/paiements/${id}`),
    record: (data) => request('POST', '/paiements', data),
    getByContrat: (contratId) => request('GET', `/paiements/contrat/${contratId}`),
    getByMonth: (mois, annee) => request('GET', `/paiements/month/${mois}/${annee}`)
  },
  
  // Quittances
  quittances: {
    my: () => request('GET', '/quittances/my'),
    get: (paiementId) => request('GET', `/quittances/${paiementId}`)
  },
  
  // Echeances
  echeances: {
    getByContrat: (contratId) => request('GET', `/echeances/contrat/${contratId}`),
    generate: (contratId, data) => request('POST', `/echeances/generate/${contratId}`, data)
  },
  
  // Incidents
  incidents: {
    list: () => request('GET', '/incidents'),
    pending: () => request('GET', '/incidents/pending'),
    active: () => request('GET', '/incidents/active'),
    stats: () => request('GET', '/incidents/stats'),
    get: (id) => request('GET', `/incidents/${id}`),
    create: (data) => request('POST', '/incidents', data),
    validate: (id, data) => request('PATCH', `/incidents/${id}/validate`, data),
    assign: (id, technicienId) => request('PATCH', `/incidents/${id}/assign`, { technicien_id: technicienId }),
    updateStatut: (id, statut) => request('PATCH', `/incidents/${id}/statut`, { statut })
  },
  
  // Interventions
  interventions: {
    my: () => request('GET', '/interventions/my'),
    all: () => request('GET', '/interventions/all'),
    byIncident: (incidentId) => request('GET', `/interventions/incident/${incidentId}`),
    create: (data) => request('POST', '/interventions', data),
    complete: (id, data) => request('PATCH', `/interventions/${id}/complete`, data)
  },
  
  // QHSE - Controles
  controlesQhse: {
    list: () => request('GET', '/controles-qhse'),
    pending: () => request('GET', '/controles-qhse/pending'),
    completed: () => request('GET', '/controles-qhse/completed'),
    stats: () => request('GET', '/controles-qhse/stats'),
    get: (id) => request('GET', `/controles-qhse/${id}`),
    create: (data) => request('POST', '/controles-qhse', data),
    recordScores: (id, data) => request('PATCH', `/controles-qhse/${id}/scores`, data)
  },
  
  // QHSE - Sanctions
  sanctions: {
    list: () => request('GET', '/sanctions'),
    active: () => request('GET', '/sanctions/active'),
    stats: () => request('GET', '/sanctions/stats'),
    get: (id) => request('GET', `/sanctions/${id}`),
    create: (data) => request('POST', '/sanctions', data),
    lever: (id) => request('PATCH', `/sanctions/${id}/lever`)
  },
  
  // Notifications
  notifications: {
    list: () => request('GET', '/notifications'),
    unread: () => request('GET', '/notifications/unread'),
    markAsRead: (id) => request('PATCH', `/notifications/${id}/read`),
    markAllAsRead: () => request('PATCH', '/notifications/read-all'),
    create: (data) => request('POST', '/notifications', data)
  },
  
  // Dashboard
  dashboard: {
    get: () => request('GET', '/dashboard'),
    global: () => request('GET', '/dashboard/global')
  },
  
  // Courriers
  courriers: {
    list: () => request('GET', '/courriers'),
    sent: () => request('GET', '/courriers/sent'),
    received: () => request('GET', '/courriers/received'),
    unread: () => request('GET', '/courriers/unread'),
    byDemande: (demandeId) => request('GET', `/courriers/demande/${demandeId}`),
    get: (id) => request('GET', `/courriers/${id}`),
    create: (data) => request('POST', '/courriers', data),
    send: (id) => request('PATCH', `/courriers/${id}/send`),
    markAsRead: (id) => request('PATCH', `/courriers/${id}/read`)
  }
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export function isAuthenticated() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function hasRole(roles) {
  const user = getCurrentUser()
  if (!user) return false
  if (Array.isArray(roles)) {
    return roles.includes(user.role)
  }
  return user.role === roles
}
