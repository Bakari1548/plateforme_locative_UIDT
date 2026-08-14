import { Link } from 'react-router-dom'
import { Target, Eye, Users, Building2, GraduationCap, Handshake, ArrowRight } from 'lucide-react'
import PublicLayout from '../../components/PublicLayout'

export default function Presentation() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">Présentation du projet</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            La plateforme de gestion locative du CROUS-T, un outil numérique au service de la communauté universitaire de Thiès.
          </p>
        </div>
      </section>

      {/* About CROUS-T */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-accent-dark mb-6">Le CROUS-T</h2>
            <p className="text-accent-slate mb-4 leading-loose">
              Le Centre Régional des Œuvres Universitaires Sociales de Thiès (CROUS-T)
              est un établissement public à caractère administratif, placé sous la tutelle
              du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation.
            </p>
            <p className="text-accent-slate mb-4 leading-loose">
              Sa mission est d'assurer l'accueil, l'hébergement, la restauration et le
              bien-être des étudiants de la région de Thiès, dans le cadre de la politique
              nationale de soutien à la vie étudiante.
            </p>
            <p className="text-accent-slate leading-loose">
              Le CROUS-T gère un parc immobilier composé de résidences universitaires,
              de locaux commerciaux et d'espaces associatifs, mis à disposition des
              étudiants et des partenaires institutionnels.
            </p>
          </div>
          <div className="bg-accent-lighter rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Building2, label: 'Résidences universitaires', value: '3' },
                { icon: Users, label: 'Étudiants accueillis', value: '2 000+' },
                { icon: GraduationCap, label: 'Établissements partenaires', value: '6' },
                { icon: Handshake, label: "Années d'expérience", value: '15+' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="h-12 w-12 text-primary-700 mx-auto mb-3" />
                  <p className="text-3xl font-extrabold text-primary-700">{item.value}</p>
                  <p className="text-sm text-accent-slate">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-accent-lighter">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-primary-700 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-dark mb-4">Notre mission</h3>
            <p className="text-accent-slate leading-loose">
              Offrir aux étudiants de la région de Thiès un cadre de vie favorable à la
              réussite de leurs études, à travers une gestion transparente et efficiente du
              parc locatif, en assurant l'équité d'accès, la qualité du service et le
              respect des normes QHSE.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-secondary-500 rounded-lg flex items-center justify-center mb-6">
              <Eye className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-dark mb-4">Notre vision</h3>
            <p className="text-accent-slate leading-loose">
              Être un centre d'excellence dans la gestion des œuvres universitaires sociales,
              en digitalisant l'ensemble de nos processus locatifs pour garantir un service
              rapide, transparent et accessible à tous les étudiants de la région de Thiès.
            </p>
          </div>
        </div>
      </section>

      {/* The platform */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-accent-dark text-center mb-4">
            La plateforme de gestion locative
          </h2>
          <p className="text-center text-accent-slate mb-12 max-w-2xl mx-auto">
            Un système d'information intégré pour la digitalisation complète du processus locatif
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Gestion des demandes',
                desc: "Dépôt en ligne, instruction par la DCUV, examen en commission et décision du Directeur. Chaque étape est tracée et notifiée.",
              },
              {
                title: 'Contrats & paiements',
                desc: "Édition de contrats, signature électronique, génération d'échéances, enregistrement des paiements et édition de quittances.",
              },
              {
                title: 'Suivi & contrôle',
                desc: "Signalement d'incidents, interventions techniques, contrôles QHSE, sanctions, et gestion des courriers administratifs.",
              },
            ].map((feature) => (
              <div key={feature.title} className="border-l-4 border-primary-700 pl-6">
                <h3 className="text-xl font-bold text-accent-dark mb-3">{feature.title}</h3>
                <p className="text-accent-slate leading-loose">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actors */}
      <section className="py-16 bg-accent-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-accent-dark text-center mb-12">
            Les acteurs du processus
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { role: 'Locataire', desc: 'Dépose et suit sa demande' },
              { role: 'DCUV', desc: 'Instruit les demandes' },
              { role: 'Commission', desc: 'Émet un avis' },
              { role: 'Directeur', desc: 'Valide les décisions' },
              { role: 'Agent recouvrement', desc: 'Encaisse les paiements' },
              { role: 'Technicien', desc: 'Réalise les interventions' },
            ].map((actor) => (
              <div key={actor.role} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <p className="font-bold text-primary-700 text-sm">{actor.role}</p>
                <p className="text-xs text-accent-slate mt-1">{actor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-4">Découvrez la procédure à suivre</h2>
          <Link
            to="/procedure"
            className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            Voir la procédure <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
