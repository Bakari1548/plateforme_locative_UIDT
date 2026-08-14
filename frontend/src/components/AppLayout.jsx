import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { Menu, X, Bell, LogOut } from 'lucide-react'
import Logo from './Logo'
import { getCurrentUser, logout } from '../lib/api'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = getCurrentUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const navItems = getNavForRole(user.role)
  const showDashboard = user.role !== 'visiteur'

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex bg-accent-lighter">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-primary-700 text-white transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-primary-600">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <Logo variant="light" size="sm" />
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          {showDashboard && (
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                isActive('/dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-600'
              }`}
            >
              Tableau de bord
            </Link>
          )}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                isActive(item.path) ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-600">
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            className="flex items-center gap-2 text-sm text-primary-100 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-accent-dark"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div>
              <span className="text-sm font-semibold text-accent-dark">{user.prenom} {user.nom}</span>
              <span className="ml-2 text-xs text-accent-slate bg-accent-light px-2 py-0.5 rounded-full">{user.role}</span>
            </div>
          </div>
          <a href="/notifications" className="relative text-accent-slate hover:text-primary-700 transition">
            <Bell className="h-6 w-6" />
          </a>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

function getNavForRole(role) {
  const nav = {
    visiteur: [
      { path: '/demandes/nouveau', label: 'Faire une demande' },
      { path: '/demandes', label: 'Mes demandes' },
    ],
    locataire: [
      { path: '/demandes', label: 'Ma demande' },
      { path: '/mon-contrat', label: 'Mon contrat' },
      { path: '/paiements', label: 'Mes paiements' },
      { path: '/incidents', label: 'Signaler incident' },
    ],
    dcuv: [
      { path: '/dcuv/demandes', label: 'Instruction demandes' },
      { path: '/dcuv/contrats', label: 'Contrats' },
      { path: '/dcuv/locaux', label: 'Locaux' },
      { path: '/dcuv/qhse', label: 'Contrôles QHSE' },
      { path: '/dcuv/interventions', label: 'Interventions' },
      { path: '/courriers', label: 'Courriers' },
    ],
    directeur: [
      { path: '/directeur', label: 'Validation décisions' },
      { path: '/dcuv/contrats', label: 'Contrats' },
    ],
    technicien: [
      { path: '/technicien', label: 'Mes interventions' },
    ],
    agentRecouv: [
      { path: '/recouvrement', label: 'Recouvrement' },
    ],
    admin: [
      { path: '/admin/users', label: 'Utilisateurs' },
      { path: '/dcuv/locaux', label: 'Locaux' },
      { path: '/dcuv/contrats', label: 'Contrats' },
      { path: '/recouvrement', label: 'Recouvrement' },
    ],
  }
  return nav[role] || []
}
