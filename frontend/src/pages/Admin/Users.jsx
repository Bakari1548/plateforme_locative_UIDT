import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Users as UsersIcon, Search, Plus, Trash2, Edit, X } from 'lucide-react'

const ROLES = [
  { value: 'visiteur', label: 'Visiteur' },
  { value: 'locataire', label: 'Locataire' },
  { value: 'dcuv', label: 'DCUV' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'technicien', label: 'Technicien' },
  { value: 'agentRecouv', label: 'Agent Recouvrement' },
  { value: 'agentCourrier', label: 'Agent Courrier' },
  { value: 'secretaireCSA', label: 'Secrétaire CSA' },
  { value: 'admin', label: 'Administrateur' }
]

const STATUTS = ['actif', 'inactif', 'suspendu']

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', profession: '',
    numero_cni: '', telephone: '', role: 'visiteur', statut: 'actif', password: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const result = await api.users.list()
    if (result.error) {
      setError(result.error)
    } else {
      setUsers(result.users || [])
    }
    setLoading(false)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadUsers()
      return
    }
    setLoading(true)
    const result = await api.users.search(searchQuery)
    if (result.error) {
      setError(result.error)
    } else {
      setUsers(result.users || [])
    }
    setLoading(false)
  }

  function openModal(user = null) {
    if (user) {
      setEditingUser(user)
      setFormData({
        prenom: user.prenom || '', nom: user.nom || '', email: user.email || '',
        profession: user.profession || '', numero_cni: user.numero_cni || '',
        telephone: user.telephone || '', role: user.role || 'visiteur',
        statut: user.statut || 'actif', password: ''
      })
    } else {
      setEditingUser(null)
      setFormData({
        prenom: '', nom: '', email: '', profession: '',
        numero_cni: '', telephone: '', role: 'visiteur', statut: 'actif', password: ''
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    
    const data = { ...formData }
    if (!data.password) delete data.password

    let result
    if (editingUser) {
      result = await api.users.update(editingUser.id, data)
    } else {
      if (!data.password || data.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères')
        return
      }
      result = await api.users.create(data)
    }

    if (result.error) {
      setError(result.error)
    } else {
      setShowModal(false)
      loadUsers()
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    const result = await api.users.delete(id)
    if (result.error) {
      setError(result.error)
    } else {
      loadUsers()
    }
  }

  async function handleStatusChange(id, statut) {
    const result = await api.users.updateStatus(id, statut)
    if (result.error) {
      setError(result.error)
    } else {
      loadUsers()
    }
  }

  async function handleRoleChange(id, role) {
    const result = await api.users.updateRole(id, role)
    if (result.error) {
      setError(result.error)
    } else {
      loadUsers()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-accent-dark">Gestion des utilisateurs</h1>
          <p className="text-sm text-accent-slate">Administration CROUS-T</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-slate" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, CNI..."
              className="w-full pl-10 pr-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-accent-dark text-white rounded-lg hover:bg-accent-slate transition">
            Rechercher
          </button>
        </form>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-accent-slate">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-accent-slate">Aucun utilisateur trouvé</div>
          ) : (
            <table className="min-w-full divide-y divide-accent-light">
              <thead className="bg-accent-lighter">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-accent-slate uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-accent-slate uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-accent-light">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent-lighter">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-accent-dark">{user.prenom} {user.nom}</div>
                      <div className="text-sm text-accent-slate">{user.profession || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-dark">{user.telephone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-accent-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.statut}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`text-sm rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          user.statut === 'actif' ? 'text-secondary-600' : 'text-accent-red'
                        }`}
                      >
                        {STATUTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(user)}
                        className="text-primary-700 hover:text-primary-800 mr-3"
                      >
                        <Edit className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-accent-red hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-accent-light">
              <h2 className="text-lg font-bold text-accent-dark">
                {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-accent-slate" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Prénom *</label>
                  <input
                    type="text" required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Nom *</label>
                  <input
                    type="text" required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-dark mb-1">Email *</label>
                <input
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-dark mb-1">
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  minLength={editingUser ? 0 : 8}
                  required={!editingUser}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Profession</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-accent-dark mb-1">Numéro CNI</label>
                <input
                  type="text"
                  value={formData.numero_cni}
                  onChange={(e) => setFormData({...formData, numero_cni: e.target.value})}
                  className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    className="block w-full border border-accent-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {STATUTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-accent-slate border border-accent-light rounded-lg hover:bg-accent-lighter transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition"
                >
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
