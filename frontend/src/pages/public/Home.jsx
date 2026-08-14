import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Building2, CreditCard, ShieldCheck, ArrowRight, CheckCircle, Users, Home as HomeIcon, TrendingUp, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import PublicLayout from '../../components/PublicLayout'
import { isAuthenticated } from '../../lib/api'
import restaurantImg from '../../assets/restaurant.png'
import multiservicesImg from '../../assets/multiservices.png'
import boutiqueImg from '../../assets/boutique-alimentaire.png'
import coiffureImg from '../../assets/coiffure.png'
import controleQhseImg from '../../assets/controle-qhse.png'

const SLIDES = [
  { image: restaurantImg, title: 'Restaurants & Restauration', subtitle: 'Des locaux adaptés pour vos activités de restauration' },
  { image: multiservicesImg, title: 'Multiservices', subtitle: 'Des espaces polyvalents pour vos commerces et services' },
  { image: boutiqueImg, title: 'Boutiques & Commerce', subtitle: 'Des emplacements stratégiques pour votre commerce' },
]

function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index) => setCurrent((index + SLIDES.length) % SLIDES.length)

  return (
    <section className="relative h-[600px] md:h-[640px] overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/50 to-primary-900/70" />
        </div>
      ))}

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center text-white">
        <p className="text-lg md:text-xl text-secondary-400 font-bold mb-2">CROUS-T</p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-3 max-w-3xl">
          {SLIDES[current].title}
        </h1>
        <p className="text-lg md:text-2xl text-primary-100 mb-2 max-w-2xl">
          {SLIDES[current].subtitle}
        </p>
        <p className="text-2xl font-bold text-secondary-400 mb-8">
          « Bien vivre pour mieux réussir »
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/presentation"
            className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            Découvrir le projet <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/procedure"
            className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-accent-lighter px-6 py-3 rounded-lg font-semibold transition"
          >
            Comment procéder ?
          </Link>
        </div>
      </div>

      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm"
        aria-label="Suivant"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all ${i === current ? 'w-8 bg-secondary-400' : 'w-2.5 bg-white/60'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

const FAQ_ITEMS = [
  { q: "Qui peut déposer une demande de local ?", a: "Toute personne majeure disposant d'une pièce d'identité valide peut déposer une demande de local auprès du CROUS-T. La demande se fait entièrement en ligne via la plateforme." },
  { q: "Quels documents sont nécessaires pour une demande ?", a: "Une copie de votre Carte Nationale d'Identité (CNI) est requise. Des documents complémentaires peuvent être demandés selon le type de local souhaité." },
  { q: "Combien de temps prend l'instruction d'une demande ?", a: "L'instruction par le DCUV prend généralement entre 5 et 10 jours ouvrés. La demande est ensuite transmise au Directeur pour décision finale." },
  { q: "Comment suivre l'état de ma demande ?", a: "Vous pouvez suivre votre demande à tout moment via votre espace locataire, en utilisant le numéro de suivi qui vous a été attribué lors de la soumission." },
  { q: "Quels types de locaux sont disponibles ?", a: "Le CROUS-T propose divers types de locaux : restaurants, boutiques, espaces multiservices, salons de coiffure, et autres commerces adaptés aux activités universitaires." },
  { q: "Comment se déroule le paiement du loyer ?", a: "Le loyer est payable selon la périodicité définie dans votre contrat. Les paiements se font via la plateforme, et des quittances sont générées automatiquement." },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-16 bg-accent-lighter">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-accent-dark text-center mb-4">
          Questions fréquentes
        </h2>
        <p className="text-center text-accent-slate mb-10">
          Tout ce que vous devez savoir avant de déposer votre demande
        </p>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-accent-light overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent-lighter/50 transition"
              >
                <span className="font-semibold text-accent-dark">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary-700 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`overflow-hidden transition-all ${openIndex === i ? 'max-h-48' : 'max-h-0'}`}>
                <p className="px-5 pb-4 text-sm text-accent-slate leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <PublicLayout>
      <HeroSlider />

      {/* Stats */}
      <section className="bg-white py-12 border-b border-accent-light">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: HomeIcon, value: '10+', label: 'Locaux disponibles' },
            { icon: Users, value: '10+', label: 'Locataires accueillis' },
            { icon: Building2, value: '5', label: 'UFR couverts' },
            { icon: TrendingUp, value: '98%', label: 'Taux de satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-10 w-10 text-secondary-500 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-primary-700">{stat.value}</p>
              <p className="text-sm text-accent-slate">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-accent-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-accent-dark text-center mb-4">
            Nos services
          </h2>
          <p className="text-center text-accent-slate mb-12 max-w-2xl mx-auto">
            Une plateforme intégrée pour la gestion complète du parc locatif du CROUS-T
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Demandes de location', desc: 'Dépôt et suivi des demandes en ligne', img: multiservicesImg },
              { icon: Building2, title: 'Gestion des contrats', desc: 'Édition, signature et résiliation', img: boutiqueImg },
              { icon: CreditCard, title: 'Paiements & quittances', desc: 'Suivi des paiements et recouvrement', img: restaurantImg },
              { icon: ShieldCheck, title: 'Contrôles QHSE', desc: 'Inspections et sanctions', img: controleQhseImg },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-accent-light"
              >
                <div className="h-40 overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary-700" />
                  </div>
                  <h3 className="text-lg font-bold text-accent-dark mb-2">{service.title}</h3>
                  <p className="text-sm text-accent-slate">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Procedure preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-accent-dark mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-accent-slate mb-12 max-w-2xl mx-auto">
            Un processus simple en 5 étapes, de la demande à l'obtention de votre local
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Demande', 'Instruction', 'Commission', 'Contrat', 'Paiement'].map((step, i) => (
              <div key={step} className="relative">
                <div className="w-12 h-12 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="font-semibold text-accent-dark">{step}</p>
              </div>
            ))}
          </div>
          <Link
            to="/procedure"
            className="inline-flex items-center gap-2 mt-10 text-primary-700 font-semibold hover:text-primary-800 transition"
          >
            Voir la procédure complète <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="relative py-20 text-white overflow-hidden">
        <img src={coiffureImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary-900/85" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            Prêt à déposer votre demande ?
          </h2>
          <p className="text-primary-100 mb-8">
            Créez votre compte et accédez à la plateforme de gestion locative du CROUS-T
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated() ? '/demandes/nouveau' : '/register'}
              className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Faire une demande <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-accent-lighter px-6 py-3 rounded-lg font-semibold transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
