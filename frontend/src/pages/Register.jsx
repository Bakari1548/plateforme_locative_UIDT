import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'

export default function Register() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    numero_cni: '',
    telephone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        navigate('/login', { 
          state: { message: 'Inscription réussie ! Connectez-vous pour faire votre première demande.' }
        })
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-accent-lighter">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/"><Logo variant="dark" size="sm" /></Link>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent-slate hover:text-primary-700 transition">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-xl bg-primary-700">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-accent-dark">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-accent-slate">
              CROUS-T — Plateforme de Gestion Locative
            </p>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-semibold text-accent-dark mb-1">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-accent-dark mb-1">
                  Nom *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-accent-dark mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="vous@exemple.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-accent-dark mb-1">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="8"
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-accent-dark mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-semibold text-accent-dark mb-1">
                Profession
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Profession"
                value={formData.profession}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="numero_cni" className="block text-sm font-semibold text-accent-dark mb-1">
                Numéro CNI
              </label>
              <input
                id="numero_cni"
                name="numero_cni"
                type="text"
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Numéro de carte d'identité"
                value={formData.numero_cni}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-semibold text-accent-dark mb-1">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                className="appearance-none block w-full px-4 py-2.5 border border-accent-light rounded-lg bg-white text-accent-dark placeholder-accent-slate focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-semibold text-primary-700 hover:text-primary-800 transition"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
