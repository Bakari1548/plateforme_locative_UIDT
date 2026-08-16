import { forwardRef } from 'react'
import logoImg from '../assets/logo_croust.png'

const BLUE = '#004f80'
const BLUE_DARK = '#003f66'
const TEAL = '#04a2af'
const LIGHT_BG = '#e6f0f7'

const articleTitle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: BLUE,
  padding: '4px 10px',
  marginTop: '14px',
  marginBottom: '6px',
  borderRadius: '3px',
}

const tableStyle = {
  width: '100%',
  fontSize: '10px',
  marginBottom: '8px',
  borderCollapse: 'collapse',
}

const tdLabel = {
  fontWeight: 'bold',
  width: '35%',
  padding: '3px 8px',
  backgroundColor: LIGHT_BG,
  border: '1px solid #cce0ef',
  color: BLUE_DARK,
}

const tdValue = {
  padding: '3px 8px',
  border: '1px solid #cce0ef',
}

const ContratTemplate = forwardRef(({ contrat }, ref) => {
  if (!contrat) return null
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '……………………………………………'
  const fmtMontant = (m) => m ? Number(m).toLocaleString('fr-FR') + ' FCFA' : '…………………………………………… FCFA'

  return (
    <div ref={ref} style={{ fontFamily: 'Overpass, Arial, sans-serif', fontSize: '11px', lineHeight: '1.55', color: '#192a3d', maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
      {/* Header with logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `3px solid ${BLUE}`, paddingBottom: '12px', marginBottom: '16px' }}>
        <img src={logoImg} alt="CROUS-T" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: BLUE, textTransform: 'uppercase' }}>
            Centre Régional des Œuvres Universitaires et Sociales de Thiès
          </div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: TEAL, marginTop: '4px' }}>
            CONTRAT D'ATTRIBUTION D'OCCUPATION TEMPORAIRE D'UN LOCAL
          </div>
          <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#3a4f66', marginTop: '2px' }}>
            Site VCN — Cantines, boutiques et espaces à usage commercial
          </div>
        </div>
      </div>

      {/* Reference */}
      <div style={{ backgroundColor: LIGHT_BG, padding: '6px 10px', borderRadius: '3px', marginBottom: '12px', fontSize: '10px' }}>
        <strong style={{ color: BLUE }}>Référence du contrat :</strong> {contrat.reference || '………………'} &nbsp;|&nbsp;
        <strong style={{ color: BLUE }}>N° de suivi :</strong> {contrat.numero_suivi || '………………'}
      </div>

      {/* Parties */}
      <p style={{ marginBottom: '4px' }}>Entre les soussignés :</p>
      <p style={{ marginBottom: '4px' }}>
        Le Centre Régional des Œuvres Universitaires et Sociales de Thiès (CROUS-T), établissement public à caractère administratif,
        représenté par son Directeur, ci-après désigné <strong>« le CROUS-T »</strong> ou <strong>« le Bailleur »</strong>,
      </p>
      <p style={{ marginBottom: '8px' }}><strong>D'une part,</strong></p>

      <table style={tableStyle}>
        <tbody>
          <tr><td style={tdLabel}>Nom et prénom(s)</td><td style={tdValue}>{contrat.nom || '…'} {contrat.prenom || '…'}</td></tr>
          <tr><td style={tdLabel}>Numéro CNI</td><td style={tdValue}>{contrat.numero_cni || '……………………………………………'}</td></tr>
          <tr><td style={tdLabel}>Profession / activité</td><td style={tdValue}>{contrat.profession || '……………………………………………'}</td></tr>
          <tr><td style={tdLabel}>Téléphone</td><td style={tdValue}>{contrat.telephone || '……………………………………………'}</td></tr>
        </tbody>
      </table>
      <p style={{ marginBottom: '4px' }}>ci-après désigné <strong>« le Preneur »</strong> ou <strong>« l'Occupant »</strong>,</p>
      <p style={{ marginBottom: '8px' }}><strong>D'autre part,</strong></p>
      <p style={{ marginBottom: '10px' }}>Il a été convenu ce qui suit :</p>

      {/* Article 1 */}
      <div style={articleTitle}>Article 1 — Objet du contrat</div>
      <p style={{ marginBottom: '6px' }}>
        Le présent contrat a pour objet l'attribution au Preneur, à titre onéreux, d'un local à usage commercial situé sur le site VCN,
        dans les conditions fixées ci-après, à la suite de l'instruction et de la décision d'attribution rendues conformément à la procédure
        en vigueur au CROUS-T (dépôt de la demande, étude par la DCUV, décision du Directeur).
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><td style={tdLabel}>Référence du local</td><td style={tdValue}>{contrat.local_reference || '……………………………………………'}</td></tr>
          <tr><td style={tdLabel}>Type de local</td><td style={tdValue}>{contrat.local_type || '……………………………………………'}</td></tr>
          <tr><td style={tdLabel}>Zone / emplacement</td><td style={tdValue}>{contrat.zone || '……………………………………………'}</td></tr>
          <tr><td style={tdLabel}>Usage autorisé</td><td style={tdValue}>{contrat.local_usage || contrat.type_local || '……………………………………………'}</td></tr>
        </tbody>
      </table>

      {/* Article 2 */}
      <div style={articleTitle}>Article 2 — Durée</div>
      <p style={{ marginBottom: '6px' }}>
        Le présent contrat est conclu pour une durée indéterminée, à compter de sa date de signature, sous réserve des dispositions de
        résiliation prévues à l'article 9 ci-après.
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><td style={tdLabel}>Date de prise d'effet</td><td style={tdValue}>{fmtDate(contrat.date_debut)}</td></tr>
          {contrat.date_fin && <tr><td style={tdLabel}>Date de fin (le cas échéant)</td><td style={tdValue}>{fmtDate(contrat.date_fin)}</td></tr>}
        </tbody>
      </table>

      {/* Article 3 */}
      <div style={articleTitle}>Article 3 — Loyer et modalités de paiement</div>
      <table style={tableStyle}>
        <tbody>
          <tr><td style={tdLabel}>Loyer {contrat.periodicite || 'mensuel'}</td><td style={tdValue}>{fmtMontant(contrat.montant_loyer)}</td></tr>
          <tr><td style={tdLabel}>Date limite de paiement</td><td style={tdValue}>Le 5 de chaque mois</td></tr>
          <tr><td style={tdLabel}>Mode de paiement</td><td style={tdValue}>Espèces ☐ &nbsp; Mobile Money ☐</td></tr>
        </tbody>
      </table>
      <p style={{ marginBottom: '4px' }}>
        Le paiement du loyer donne lieu, à chaque règlement, à la délivrance d'une quittance numérotée par le Bureau de Recouvrement du CROUS-T,
        mentionnant le nom du Preneur, la période concernée, le montant versé et la date de paiement.
      </p>
      <p style={{ marginBottom: '8px' }}>
        Tout retard de paiement fait l'objet d'une relance (orale puis écrite) par le Bureau de Recouvrement. À défaut de régularisation dans un
        délai de huit (8) jours à compter de la relance écrite, le CROUS-T se réserve le droit d'engager la procédure de résiliation prévue à l'article 9.
      </p>

      {/* Article 4 */}
      <div style={articleTitle}>Article 4 — Garantie</div>
      <p style={{ marginBottom: '8px' }}>
        Le Preneur verse, à la signature du présent contrat, un dépôt de garantie d'un montant de <strong>{fmtMontant(contrat.caution)}</strong>,
        restituable en fin de contrat sous déduction, le cas échéant, des sommes dues au CROUS-T (loyers impayés, dégradations constatées).
      </p>

      {/* Article 5 */}
      <div style={articleTitle}>Article 5 — Obligations du Preneur (Norme QHSE)</div>
      <ul style={{ paddingLeft: '18px', marginBottom: '8px' }}>
        <li>Affecter le local exclusivement à l'usage autorisé mentionné à l'article 1er ;</li>
        <li>S'acquitter du loyer aux échéances convenues et conserver les quittances délivrées ;</li>
        <li>Maintenir le local et ses abords en parfait état de propreté, notamment en respectant la consigne de nettoyage quotidien ;</li>
        <li>Se soumettre aux contrôles, y compris inopinés, effectués par les services compétents du CROUS-T ;</li>
        <li>Signaler sans délai au CROUS-T (DCUV ou service technique) tout incident ou dysfonctionnement technico-fonctionnel affectant le local ;</li>
        <li>Ne procéder à aucuns travaux, transformation ou installation d'enseigne sans autorisation écrite préalable du CROUS-T ;</li>
        <li>Ne pas céder, sous-louer ou transférer l'occupation du local à un tiers sans l'accord préalable et écrit du CROUS-T (voir article 10) ;</li>
        <li>Pratiquer des prix conformes aux plafonds éventuellement fixés ou communiqués par le CROUS-T ;</li>
        <li>Restituer le local en bon état à l'expiration ou à la résiliation du contrat.</li>
      </ul>

      {/* Article 6 */}
      <div style={articleTitle}>Article 6 — Obligations du CROUS-T</div>
      <ul style={{ paddingLeft: '18px', marginBottom: '6px' }}>
        <li>Mettre le local à disposition du Preneur en bon état d'usage à la date de prise d'effet du contrat ;</li>
        <li>Assurer, par l'intermédiaire de ses services techniques, la prise en charge des réparations relevant de la structure du local (installations électriques, plomberie, gros œuvre), dans un délai raisonnable après signalement ;</li>
        <li>Délivrer une quittance à chaque paiement de loyer ;</li>
        <li>Informer le Preneur de toute décision le concernant (résultat d'un contrôle, procédure de résiliation, etc.).</li>
      </ul>
      <p style={{ marginBottom: '8px' }}>
        Il est précisé, à titre de transparence, qu'en cas d'indisponibilité ou de délai d'intervention anormalement long des services techniques
        du CROUS-T pour une réparation relevant de leur responsabilité, toute prise en charge financière assumée à titre exceptionnel par le Preneur
        devra faire l'objet d'un accord écrit préalable et pourra donner lieu à un remboursement ou une compensation, selon des modalités à définir par le CROUS-T.
      </p>

      {/* Article 7 */}
      <div style={articleTitle}>Article 7 — Contrôle QHSE et conformité</div>
      <p style={{ marginBottom: '4px' }}>
        Le CROUS-T se réserve le droit de faire procéder, à tout moment et notamment de façon inopinée, à des contrôles portant sur le respect des
        normes QHSE et sur la conformité des prix pratiqués. Tout manquement constaté peut donner lieu, selon sa gravité :
      </p>
      <ul style={{ paddingLeft: '18px', marginBottom: '8px' }}>
        <li>à un avertissement adressé au Preneur ;</li>
        <li>à l'établissement d'un procès-verbal de non-conformité ;</li>
        <li>en cas de manquement grave ou de non-conformité répétée, à la résiliation du présent contrat dans les conditions de l'article 9.</li>
      </ul>

      {/* Article 8 */}
      <div style={articleTitle}>Article 8 — Interdictions particulières</div>
      <p style={{ marginBottom: '4px' }}>Sont notamment interdits :</p>
      <ul style={{ paddingLeft: '18px', marginBottom: '8px' }}>
        <li>L'usage du local à des fins autres que celles mentionnées à l'article 1 ;</li>
        <li>La cession, sous-location ou transfert de l'occupation du local sans l'accord préalable et écrit du CROUS-T ;</li>
        <li>L'entreposage de matières dangereuses, inflammables ou explosives sans autorisation préalable ;</li>
        <li>La vente de produits périmés, avariés ou non conformes aux normes sanitaires en vigueur ;</li>
        <li>L'obstruction des voies d'accès, issues de secours ou espaces communs du site VCN ;</li>
        <li>Toute activité génératrice de nuisances sonores excessives ou de troubles à l'ordre public.</li>
      </ul>

      {/* Article 9 */}
      <div style={articleTitle}>Article 9 — Résiliation</div>
      <p style={{ marginBottom: '4px' }}>
        Le Preneur peut résilier le présent contrat à tout moment, moyennant un préavis écrit de trois (3) mois adressé au CROUS-T.
      </p>
      <p style={{ marginBottom: '4px' }}>
        Le CROUS-T peut résilier le présent contrat de plein droit (clause résolutoire), sans préavis, en cas de faute grave du Preneur, notamment :
        non-paiement du loyer non régularisé dans le délai prévu à l'article 3, manquement grave ou répété aux normes QHSE, usage du local non conforme
        à sa destination, ou cession/sous-location non autorisée.
      </p>
      <p style={{ marginBottom: '8px' }}>
        La résiliation est notifiée au Preneur par une mise en demeure écrite, transmise par l'intermédiaire du service courrier / CSA du CROUS-T.
        Sauf faute grave justifiant un départ immédiat, le Preneur dispose d'un délai de trois (3) mois à compter de la notification pour libérer et restituer le local.
      </p>

      {/* Article 10 */}
      <div style={articleTitle}>Article 10 — Cession et transfert du local</div>
      <p style={{ marginBottom: '8px' }}>
        Toute cession ou transfert de l'occupation du local à un autre occupant doit faire l'objet d'une demande écrite préalable auprès de la DCUV
        et d'une autorisation expresse du Directeur du CROUS-T, donnant lieu à l'établissement d'un nouveau contrat avec le nouvel occupant.
        Tout transfert réalisé en dehors de cette procédure est inopposable au CROUS-T et constitue un manquement grave au sens de l'article 9.
      </p>

      {/* Article 11 */}
      <div style={articleTitle}>Article 11 — Litiges</div>
      <p style={{ marginBottom: '8px' }}>
        Les parties s'efforceront de régler à l'amiable tout différend relatif à l'interprétation ou à l'exécution du présent contrat.
        À défaut d'accord amiable, le litige sera porté devant les juridictions compétentes de Thiès.
      </p>

      {/* Conditions particulières */}
      {contrat.conditions_particulieres && (
        <>
          <div style={articleTitle}>Conditions particulières</div>
          <p style={{ marginBottom: '8px' }}>{contrat.conditions_particulieres}</p>
        </>
      )}

      {/* Footer */}
      <div style={{ borderTop: `2px solid ${BLUE}`, marginTop: '16px', paddingTop: '12px' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '12px' }}>
          Fait à Thiès, le {new Date().toLocaleDateString('fr-FR')}.
        </p>
      </div>
    </div>
  )
})

export default ContratTemplate
