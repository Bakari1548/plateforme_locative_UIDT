import logoImg from '../assets/logo_croust.png'

function getLogoBase64() {
  return logoImg
}

export function generateQuittancePDF(quittance) {
  const dateEmission = new Date(quittance.date_emission).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const datePaiement = new Date(quittance.date_paiement).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const modeLabel = {
    especes: 'Espèces',
    cheque: 'Chèque',
    virement: 'Virement bancaire',
    mobile_money: 'Mobile Money (Wave)'
  }[quittance.mode_paiement] || quittance.mode_paiement

  const montant = parseFloat(quittance.paiement_montant || quittance.montant).toLocaleString('fr-FR')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quittance ${quittance.reference}</title>
<style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: #f1f5f9; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 0; position: relative; overflow: hidden; }

  /* Header band */
  .header { background: linear-gradient(135deg, #1e40af 0%, #312e81 100%); padding: 30px 40px; color: white; display: flex; align-items: center; gap: 20px; }
  .header img { height: 70px; border-radius: 8px; background: white; padding: 6px; }
  .header .title h1 { font-size: 26px; font-weight: 800; letter-spacing: 1px; }
  .header .title p { font-size: 13px; opacity: 0.85; margin-top: 4px; }

  /* Body */
  .body { padding: 35px 40px; }

  .quittance-title { text-align: center; margin: 25px 0 30px; }
  .quittance-title h2 { font-size: 22px; color: #1e40af; text-transform: uppercase; letter-spacing: 3px; }
  .quittance-title .ref { font-size: 14px; color: #64748b; margin-top: 6px; }
  .quittance-title .date { font-size: 13px; color: #94a3b8; margin-top: 4px; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
  .info-card { background: #f8fafc; border-left: 4px solid #1e40af; border-radius: 6px; padding: 14px 18px; }
  .info-card .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
  .info-card .value { font-size: 15px; color: #1e293b; font-weight: 600; margin-top: 4px; }

  /* Amount section */
  .amount-section { background: linear-gradient(135deg, #1e40af08 0%, #312e8108 100%); border: 2px solid #1e40af; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
  .amount-section .label { font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 1px; }
  .amount-section .amount { font-size: 42px; font-weight: 800; color: #1e40af; margin: 10px 0; }
  .amount-section .amount span { font-size: 20px; font-weight: 600; }
  .amount-section .periode { font-size: 14px; color: #475569; }

  /* Details table */
  .details { width: 100%; border-collapse: collapse; margin: 25px 0; }
  .details td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  .details td:first-child { color: #64748b; font-weight: 600; width: 40%; }
  .details td:last-child { color: #1e293b; font-weight: 500; }

  /* Stamp */
  .stamp { position: absolute; bottom: 120px; right: 50px; width: 120px; height: 120px; border: 3px solid #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); opacity: 0.15; }
  .stamp span { font-size: 14px; font-weight: 800; color: #1e40af; text-transform: uppercase; text-align: center; }

  /* Footer */
  .footer { position: absolute; bottom: 0; left: 0; right: 0; background: #1e293b; color: #94a3b8; padding: 18px 40px; font-size: 11px; text-align: center; }
  .footer strong { color: #cbd5e1; }
  .signature { margin-top: 35px; text-align: right; }
  .signature .line { width: 200px; border-top: 1px solid #cbd5e1; margin-left: auto; padding-top: 8px; font-size: 12px; color: #64748b; }

  @media print { body { background: white; } .page { box-shadow: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <img src="${getLogoBase64()}" alt="CROUS-T" />
  </div>

  <div class="body">
    <div class="quittance-title">
      <h2>Quittance de Loyer</h2>
      <div class="ref">Référence : ${quittance.reference}</div>
      <div class="date">Émise le ${dateEmission}</div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <div class="label">Locataire</div>
        <div class="value">${quittance.prenom} ${quittance.nom}</div>
      </div>
      <div class="info-card">
        <div class="label">Contrat</div>
        <div class="value">${quittance.contrat_reference}</div>
      </div>
      <div class="info-card">
        <div class="label">Date de paiement</div>
        <div class="value">${datePaiement}</div>
      </div>
      <div class="info-card">
        <div class="label">Mode de paiement</div>
        <div class="value">${modeLabel}</div>
      </div>
    </div>

    <div class="amount-section">
      <div class="label">Montant réglé</div>
      <div class="amount">${montant} <span>FCFA</span></div>
      <div class="periode">Période : ${quittance.periode}</div>
    </div>

    <table class="details">
      <tr><td>N° de quittance</td><td>${quittance.reference}</td></tr>
      <tr><td>Loyer mensuel</td><td>${parseFloat(quittance.montant_loyer || 0).toLocaleString('fr-FR')} FCFA</td></tr>
      <tr><td>Locataire</td><td>${quittance.prenom} ${quittance.nom}</td></tr>
      <tr><td>Contact</td><td>${quittance.telephone || '—'} | ${quittance.email || '—'}</td></tr>
      ${quittance.profession ? `<tr><td>Profession</td><td>${quittance.profession}</td></tr>` : ''}
    </table>

    <div class="stamp"><span>Payé</span></div>

    <div class="signature">
      <div class="line">Signature et cachet du CROUS-T</div>
    </div>
  </div>

  <div class="footer">
    <strong>CROUS-T</strong> — Caisse Régionale Universitaire Sociale de Toulouse &nbsp;|&nbsp;
    Document généré électroniquement le ${new Date().toLocaleString('fr-FR')} &nbsp;|&nbsp;
    Cette quittance fait foi de paiement du loyer pour la période indiquée.
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('Veuillez autoriser les pop-ups pour télécharger la quittance')
    return
  }
  win.document.write(html)
  win.document.close()
}
