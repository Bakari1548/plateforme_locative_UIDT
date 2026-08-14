import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/presentation', label: 'Présentation' },
    { to: '/procedure', label: 'Procédure' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-accent-lighter">
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <span className="hidden sm:inline">Centre Régional des Œuvres Universitaires Sociales de Thiès</span>
          <div className="flex items-center gap-4">
            <a href="/login" className="hover:text-primary-200 transition">Connexion</a>
            <a href="/register" className="bg-secondary-500 hover:bg-secondary-600 px-3 py-1 rounded transition">S'inscrire</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/">
            <Logo variant="dark" size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-accent-dark font-semibold hover:text-primary-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-accent-dark"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-accent-light px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block text-accent-dark font-semibold hover:text-primary-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-accent-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo variant="light" size="sm" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Centre Régional des Œuvres Universitaires Sociales de Thiès.
              Bien vivre pour mieux réussir.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 text-secondary-400">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 text-secondary-400">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Thiès, Sénégal</li>
              <li>+221 33 951 00 00</li>
              <li>contact@croust.sn</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 text-secondary-400">Plateforme</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/login" className="hover:text-white transition">Connexion</a></li>
              <li><a href="/register" className="hover:text-white transition">Inscription</a></li>
              <li><a href="/procedure" className="hover:text-white transition">Comment procéder</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CROUS-T. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
