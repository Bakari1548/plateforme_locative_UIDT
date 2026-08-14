import { Link } from 'react-router-dom'
import { FileText, Search, Users, CheckCircle, Building2, CreditCard, Wrench, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import PublicLayout from '../../components/PublicLayout'

export default function Procedure() {
  const steps = [
    {
      num: 1,
      icon: FileText,
      title: 'Dépôt de la demande',
      actor: 'Locataire',
      desc: "Le locataire crée un compte sur la plateforme, remplit le formulaire de demande de location en ligne et télécharge les pièces justificatives nécessaires.",
      details: [
        'Création de compte sur la plateforme',
        'Remplissage du formulaire de demande',
        'Téléchargement des pièces justificatives',
        'Soumission de la demande',
      ],
    },
    {
      num: 2,
      icon: Search,
      title: 'Instruction du dossier',
      actor: 'DCUV',
      desc: "La Direction de la Coordination des Œuvres Universitaires (DCUV) instruit le dossier : vérification de l'éligibilité, conformité des pièces, et affectation à une commission.",
      details: [
        "Vérification de l'éligibilité du demandeur",
        'Contrôle de conformité des pièces',
        "Affectation à une commission d'examen",
        'Notification au demandeur',
      ],
    },
    {
      num: 3,
      icon: Users,
      title: 'Examen en commission',
      actor: 'Commission',
      desc: "La commission examine le dossier et émet un avis favorable ou défavorable. L'avis est transmis au Directeur pour décision finale.",
      details: [
        'Examen du dossier par les membres',
        "Émission d'un avis (favorable/défavorable)",
        "Transmission de l'avis au Directeur",
      ],
    },
    {
      num: 4,
      icon: CheckCircle,
      title: 'Décision du Directeur',
      actor: 'Directeur',
      desc: "Le Directeur du CROUS-T prend la décision finale d'attribution ou de refus. En cas d'attribution, un contrat de location est édité.",
      details: [
        'Validation ou refus de la demande',
        "Édition du contrat de location en cas d'acceptation",
        'Notification de la décision au demandeur',
      ],
    },
    {
      num: 5,
      icon: Building2,
      title: 'Signature du contrat',
      actor: 'Locataire & DCUV',
      desc: "Le contrat est signé électroniquement par le locataire et par la DCUV. Les échéances de paiement sont ensuite générées automatiquement.",
      details: [
        'Signature électronique par le locataire',
        'Signature par la DCUV',
        'Génération automatique des échéances',
        'Remise des clés',
      ],
    },
    {
      num: 6,
      icon: CreditCard,
      title: 'Paiement du loyer',
      actor: 'Locataire & Agent de recouvrement',
      desc: "Le locataire règle son loyer selon les échéances. L'agent de recouvrement enregistre les paiements et émet les quittances.",
      details: [
        'Paiement du loyer aux échéances',
        "Enregistrement du paiement par l'agent",
        'Édition de la quittance',
        'Suivi des impayés le cas échéant',
      ],
    },
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">Procédure d'attribution</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Toutes les étapes, de la demande à l'obtention de votre local
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.num} className="flex gap-6">
                {/* Line connector */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shrink-0">
                    {step.num}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-accent-light mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-6 w-6 text-secondary-500" />
                    <h3 className="text-xl font-bold text-accent-dark">{step.title}</h3>
                  </div>
                  <p className="text-sm font-semibold text-primary-700 mb-3">
                    Acteur : {step.actor}
                  </p>
                  <p className="text-accent-slate leading-loose mb-4">
                    {step.desc}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-accent-slate">
                        <CheckCircle className="h-4 w-4 text-secondary-500 mt-1 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional info */}
      <section className="py-16 bg-accent-lighter">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <Wrench className="h-10 w-10 text-accent-orange mb-4" />
            <h3 className="text-xl font-bold text-accent-dark mb-3">Signalement d'incidents</h3>
            <p className="text-accent-slate leading-loose">
              En cas de problème technique dans votre local (plomberie, électricité, etc.),
              vous pouvez signaler un incident via la plateforme. Un technicien sera affecté
              pour intervenir dans les meilleurs délais.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <ShieldCheck className="h-10 w-10 text-secondary-500 mb-4" />
            <h3 className="text-xl font-bold text-accent-dark mb-3">Contrôles QHSE</h3>
            <p className="text-accent-slate leading-loose">
              Le CROUS-T effectue régulièrement des contrôles Qualité, Hygiène, Sécurité
              et Environnement dans les locaux. Les non-conformités peuvent entraîner des
              sanctions.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-white border-t border-accent-light">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link
            to="/presentation"
            className="inline-flex items-center gap-2 text-accent-slate hover:text-primary-700 font-semibold transition"
          >
            <ArrowLeft className="h-5 w-5" /> Présentation
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold transition"
          >
            Nous contacter <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
