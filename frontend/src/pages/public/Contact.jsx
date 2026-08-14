import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import PublicLayout from '../../components/PublicLayout'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setForm({ nom: '', email: '', sujet: '', message: '' })
    }, 4000)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">Contactez-nous</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Une question ? Besoin d'informations ? L'équipe du CROUS-T est à votre écoute.
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-extrabold text-accent-dark mb-6">Coordonnées</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark">Adresse</h3>
                  <p className="text-accent-slate">CROUS-T<br />Thiès, Sénégal</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark">Téléphone</h3>
                  <p className="text-accent-slate">+221 33 951 00 00</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark">Email</h3>
                  <p className="text-accent-slate">contact@croust.sn</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark">Horaires</h3>
                  <p className="text-accent-slate">
                    Lundi - Vendredi : 8h00 - 17h00<br />
                    Samedi : 8h00 - 12h00<br />
                    Dimanche : Fermé
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-accent-lighter rounded-2xl p-8">
            <h2 className="text-2xl font-extrabold text-accent-dark mb-6">Envoyer un message</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-16 w-16 text-secondary-500 mb-4" />
                <p className="text-lg font-bold text-accent-dark">Message envoyé !</p>
                <p className="text-accent-slate mt-2">Nous vous répondrons dans les meilleurs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Nom complet</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-light bg-white text-accent-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-light bg-white text-accent-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Sujet</label>
                  <input
                    type="text"
                    name="sujet"
                    value={form.sujet}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-light bg-white text-accent-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Objet de votre message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-accent-dark mb-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-light bg-white text-accent-dark focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Votre message..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-lg font-semibold transition w-full justify-center"
                >
                  <Send className="h-5 w-5" />
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-accent-lighter py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <MapPin className="h-16 w-16 text-primary-700 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-accent-dark mb-2">Nous trouver</h2>
            <p className="text-accent-slate">CROUS-T — Thiès, Sénégal</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
