<?php

require_once __DIR__ . '/../config/database.php';

App\Config\Database::init();
$db = App\Config\Database::getInstance();

// ============================================================
// Données de référence (contexte sénégalais - site VCN, Dakar)
// ============================================================

$prenomsHommes = ['Amadou', 'Moussa', 'Ibrahima', 'Ousmane', 'Modou', 'Babacar', 'Abdou', 'Mamadou', 'Cheikh', 'Serigne', 'Alioune', 'Pape', 'Lamine', 'Malick', 'Souleymane', 'Boubacar', 'Idrissa', 'El Hadji', 'Assane', 'Demba'];
$prenomsFemmes = ['Fatou', 'Aïssatou', 'Mariama', 'Ndeye', 'Awa', 'Khadija', 'Aminata', 'Sokhna', 'Astou', 'Fatimata', 'Bineta', 'Coumba', 'Dieynaba', 'Rokhaya', 'Adama', 'Yacine', 'Marième', 'Aida', 'Ngoné', 'Oumou'];
$noms = ['Diop', 'Ndiaye', 'Fall', 'Sow', 'Diallo', 'Ba', 'Gueye', 'Sarr', 'Cissé', 'Faye', 'Mbaye', 'Sy', 'Kane', 'Touré', 'Diouf', 'Seck', 'Camara', 'Thiam', 'Niang', 'Wade', 'Sagna', 'Mendy', 'Badji', 'Konaté'];

$zonesDakar = ['Plateau', 'Médina', 'Yoff', 'Parcelles Assainies', 'Sicap Liberté', 'Grand Yoff', 'Ouakam', 'Fann', 'Ngor', 'Pikine', 'Guédiawaye', 'Rufisque', 'HLM', 'Point E'];

$professions = ['Restaurateur', 'Commerçant', 'Multiservices', 'Coiffeur', 'Libraire', 'Cybercafé'];

function randomPhone(): string
{
    $prefixes = ['77', '78', '76', '70', '75'];
    return '+221 ' . $prefixes[array_rand($prefixes)] . ' ' . rand(100, 999) . ' ' . rand(10, 99) . ' ' . rand(10, 99);
}

function randomCNI(): string
{
    return '1' . rand(100000000000, 999999999999);
}

function slugify(string $str): string
{
    $str = str_replace(['é', 'è', 'ê', 'à', 'â', 'ô', 'î', 'ï', 'ç', 'ù', 'ë'], ['e', 'e', 'e', 'a', 'a', 'o', 'i', 'i', 'c', 'u', 'e'], mb_strtolower($str));
    return preg_replace('/[^a-z0-9]/', '', $str);
}

$passwordHash = password_hash('password123', PASSWORD_BCRYPT);

echo "=== Démarrage du seed de données (contexte Sénégal) ===\n\n";

try {
    $db->beginTransaction();

    // ============================================================
    // 1. UTILISATEURS
    // ============================================================
    echo "-> Création des utilisateurs...\n";

    $insertUser = $db->prepare("INSERT INTO utilisateurs (prenom, nom, profession, numero_cni, telephone, email, role, statut, password_hash)
        VALUES (:prenom, :nom, :profession, :cni, :tel, :email, :role, :statut, :hash)");

    $userIds = ['locataires' => [], 'techniciens' => [], 'dcuv' => [], 'agentRecouv' => [], 'agentCourrier' => []];

    // Admin
    $insertUser->execute(['prenom' => 'Cheikh', 'nom' => 'Diop', 'profession' => 'Administrateur système', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'admin@crous-t.sn', 'role' => 'admin', 'statut' => 'actif', 'hash' => $passwordHash]);

    // Directeur
    $insertUser->execute(['prenom' => 'El Hadji', 'nom' => 'Ndiaye', 'profession' => 'Directeur du COUD', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'directeur@crous-t.sn', 'role' => 'directeur', 'statut' => 'actif', 'hash' => $passwordHash]);
    $directeurId = (int) $db->lastInsertId();

    // DCUV (3)
    $dcuvNoms = [['Mamadou', 'Fall'], ['Aïssatou', 'Sarr'], ['Ibrahima', 'Ba']];
    foreach ($dcuvNoms as $i => [$prenom, $nom]) {
        $insertUser->execute(['prenom' => $prenom, 'nom' => $nom, 'profession' => 'Agent DCUV', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'dcuv' . ($i + 1) . '@crous-t.sn', 'role' => 'dcuv', 'statut' => 'actif', 'hash' => $passwordHash]);
        $userIds['dcuv'][] = (int) $db->lastInsertId();
    }

    // Secrétaire CSA
    $insertUser->execute(['prenom' => 'Ndeye', 'nom' => 'Gueye', 'profession' => 'Secrétaire CSA', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'secretaire@crous-t.sn', 'role' => 'secretaireCSA', 'statut' => 'actif', 'hash' => $passwordHash]);
    $secretaireId = (int) $db->lastInsertId();

    // Techniciens (3)
    $techNoms = [['Ousmane', 'Sow'], ['Modou', 'Diallo'], ['Boubacar', 'Kane']];
    foreach ($techNoms as $i => [$prenom, $nom]) {
        $insertUser->execute(['prenom' => $prenom, 'nom' => $nom, 'profession' => 'Technicien maintenance', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'technicien' . ($i + 1) . '@crous-t.sn', 'role' => 'technicien', 'statut' => 'actif', 'hash' => $passwordHash]);
        $userIds['techniciens'][] = (int) $db->lastInsertId();
    }

    // Agents de recouvrement (2)
    $recouvNoms = [['Babacar', 'Faye'], ['Awa', 'Cissé']];
    foreach ($recouvNoms as $i => [$prenom, $nom]) {
        $insertUser->execute(['prenom' => $prenom, 'nom' => $nom, 'profession' => 'Agent de recouvrement', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'recouvrement' . ($i + 1) . '@crous-t.sn', 'role' => 'agentRecouv', 'statut' => 'actif', 'hash' => $passwordHash]);
        $userIds['agentRecouv'][] = (int) $db->lastInsertId();
    }

    // Agents courrier (2)
    $courrierNoms = [['Khadija', 'Mbaye'], ['Idrissa', 'Thiam']];
    foreach ($courrierNoms as $i => [$prenom, $nom]) {
        $insertUser->execute(['prenom' => $prenom, 'nom' => $nom, 'profession' => 'Agent courrier', 'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => 'courrier' . ($i + 1) . '@crous-t.sn', 'role' => 'agentCourrier', 'statut' => 'actif', 'hash' => $passwordHash]);
        $userIds['agentCourrier'][] = (int) $db->lastInsertId();
    }

    // Locataires (20)
    for ($i = 0; $i < 20; $i++) {
        $isHomme = rand(0, 1) === 0;
        $prenom = $isHomme ? $prenomsHommes[array_rand($prenomsHommes)] : $prenomsFemmes[array_rand($prenomsFemmes)];
        $nom = $noms[array_rand($noms)];
        $email = slugify($prenom) . '.' . slugify($nom) . $i . '@gmail.com';
        $insertUser->execute([
            'prenom' => $prenom, 'nom' => $nom,
            'profession' => $professions[array_rand($professions)],
            'cni' => randomCNI(), 'tel' => randomPhone(), 'email' => $email,
            'role' => 'locataire', 'statut' => 'actif', 'hash' => $passwordHash
        ]);
        $userIds['locataires'][] = (int) $db->lastInsertId();
    }

    echo "   " . (5 + count($userIds['dcuv']) + count($userIds['techniciens']) + count($userIds['agentRecouv']) + count($userIds['agentCourrier']) + count($userIds['locataires'])) . " utilisateurs créés.\n";

    // ============================================================
    // 2. LOCAUX
    // ============================================================
    echo "-> Création des locaux...\n";

    $typesLocaux = ['cantine', 'boutique', 'kiosque', 'bureau'];
    $insertLocal = $db->prepare("INSERT INTO locaux (reference, type, usage, statut, zone, surface, description, capacite, loyer_mensuel)
        VALUES (:ref, :type, :usage, :statut, :zone, :surface, :description, :capacite, :loyer)");

    $localIds = [];
    $usagesByType = [
        'cantine' => 'Restauration collective',
        'boutique' => 'Commerce général',
        'kiosque' => 'Vente rapide',
        'bureau' => 'Services administratifs'
    ];

    for ($i = 1; $i <= 18; $i++) {
        $type = $typesLocaux[array_rand($typesLocaux)];
        $zone = $zonesDakar[array_rand($zonesDakar)];
        $statut = ['disponible', 'occupe', 'occupe', 'occupe', 'en_maintenance'][array_rand(['disponible', 'occupe', 'occupe', 'occupe', 'en_maintenance'])];
        $insertLocal->execute([
            'ref' => 'VCN-' . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
            'type' => $type,
            'usage' => $usagesByType[$type],
            'statut' => $statut,
            'zone' => 'Site VCN - ' . $zone,
            'surface' => rand(8, 60),
            'description' => 'Local de type ' . $type . ' situé zone ' . $zone,
            'capacite' => rand(2, 30),
            'loyer' => rand(15, 80) * 1000 // FCFA
        ]);
        $localIds[] = (int) $db->lastInsertId();
    }

    echo "   " . count($localIds) . " locaux créés.\n";

    // ============================================================
    // 3. DEMANDES
    // ============================================================
    echo "-> Création des demandes...\n";

    $insertDemande = $db->prepare("INSERT INTO demandes (numero_suivi, user_id, type_local, motif, description, statut, date_soumission, date_instruction, instructeur_id, local_id)
        VALUES (:numero, :user_id, :type_local, :motif, :description, :statut, :date_soumission, :date_instruction, :instructeur_id, :local_id)");

    $statutsDemande = ['brouillon', 'soumis', 'en_instruction', 'recevable', 'incomplet', 'rejete', 'en_commission', 'attribue', 'non_attribue'];
    $motifs = [
        'Ouverture d\'une cantine universitaire',
        'Installation d\'une boutique de fournitures scolaires',
        'Ouverture d\'un restaurant',
        'Ouverture d\'un cybercafé pour étudiants',
        'Installation d\'un atelier de couture',
        'Exploitation d\'un point de photocopie et reprographie',
        'Ouverture d\'un salon de coiffure'
    ];

    $demandeIds = [];
    $demandeStatuts = [];
    $numDemandes = 20;
    for ($i = 0; $i < $numDemandes; $i++) {
        $statut = $statutsDemande[array_rand($statutsDemande)];
        $userId = $userIds['locataires'][array_rand($userIds['locataires'])];
        $instructeurId = $userIds['dcuv'][array_rand($userIds['dcuv'])];
        $localId = in_array($statut, ['attribue']) ? $localIds[array_rand($localIds)] : null;
        $dateSoumission = $statut === 'brouillon' ? null : date('Y-m-d H:i:s', strtotime('-' . rand(5, 90) . ' days'));
        $dateInstruction = in_array($statut, ['brouillon', 'soumis']) ? null : date('Y-m-d H:i:s', strtotime('-' . rand(1, 60) . ' days'));

        $insertDemande->execute([
            'numero' => 'DEM-2026-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
            'user_id' => $userId,
            'type_local' => $typesLocaux[array_rand($typesLocaux)],
            'motif' => $motifs[array_rand($motifs)],
            'description' => 'Demande formulée dans le cadre de l\'exploitation du site VCN, quartier ' . $zonesDakar[array_rand($zonesDakar)] . ', Dakar.',
            'statut' => $statut,
            'date_soumission' => $dateSoumission,
            'date_instruction' => $dateInstruction,
            'instructeur_id' => in_array($statut, ['brouillon', 'soumis']) ? null : $instructeurId,
            'local_id' => $localId
        ]);
        $demandeId = (int) $db->lastInsertId();
        $demandeIds[] = $demandeId;
        $demandeStatuts[$demandeId] = ['statut' => $statut, 'user_id' => $userId, 'local_id' => $localId];
    }

    echo "   " . count($demandeIds) . " demandes créées.\n";

    // ============================================================
    // 4. DOCUMENTS (liés aux demandes)
    // ============================================================
    echo "-> Création des documents...\n";

    $insertDocument = $db->prepare("INSERT INTO documents (demande_id, type_document, nom_fichier, url_fichier, taille, mime_type, statut)
        VALUES (:demande_id, :type, :nom, :url, :taille, :mime, :statut)");

    $typesDocuments = ['cni', 'casier_judiciaire', 'plan_affaires'];
    $nbDocuments = 0;
    foreach ($demandeIds as $demandeId) {
        if ($demandeStatuts[$demandeId]['statut'] === 'brouillon') continue;
        foreach ($typesDocuments as $typeDoc) {
            if (rand(0, 10) > 7) continue;
            $insertDocument->execute([
                'demande_id' => $demandeId,
                'type' => $typeDoc,
                'nom' => $typeDoc . '_' . $demandeId . '.pdf',
                'url' => '/uploads/documents/' . $typeDoc . '_' . $demandeId . '.pdf',
                'taille' => rand(50000, 2000000),
                'mime' => 'application/pdf',
                'statut' => 'valide'
            ]);
            $nbDocuments++;
        }
    }
    echo "   $nbDocuments documents créés.\n";

    // ============================================================
    // 5. COMMISSIONS + MEMBRES (pour demandes en_commission / attribue / non_attribue)
    // ============================================================
    echo "-> Création des commissions...\n";

    $insertCommission = $db->prepare("INSERT INTO commissions (demande_id, date_commission, lieu, statut, avis, avis_motive, recommandation, date_avis)
        VALUES (:demande_id, :date_commission, :lieu, :statut, :avis, :avis_motive, :recommandation, :date_avis)");
    $insertMembre = $db->prepare("INSERT INTO commission_membres (commission_id, user_id, role_commission, present, avis_particulier)
        VALUES (:commission_id, :user_id, :role, :present, :avis)");

    $nbCommissions = 0;
    foreach ($demandeIds as $demandeId) {
        $statut = $demandeStatuts[$demandeId]['statut'];
        if (!in_array($statut, ['en_commission', 'attribue', 'non_attribue'])) continue;

        $commissionStatut = $statut === 'en_commission' ? 'en_cours' : 'cloturee';
        $avis = $statut === 'attribue' ? 'favorable' : ($statut === 'non_attribue' ? 'defavorable' : null);

        $insertCommission->execute([
            'demande_id' => $demandeId,
            'date_commission' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 45) . ' days')),
            'lieu' => 'Salle de réunion COUD, Site VCN',
            'statut' => $commissionStatut,
            'avis' => $avis,
            'avis_motive' => $avis ? 'Décision prise après examen du dossier et vérification des documents fournis.' : null,
            'recommandation' => $avis === 'favorable' ? 'Attribution recommandée sous réserve du respect des conditions QHSE.' : null,
            'date_avis' => $avis ? date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days')) : null
        ]);
        $commissionId = (int) $db->lastInsertId();
        $nbCommissions++;

        // Membres: directeur + secrétaire + 2 dcuv
        $membres = [
            ['id' => $directeurId, 'role' => 'president'],
            ['id' => $secretaireId, 'role' => 'secretaire'],
        ];
        foreach (array_slice($userIds['dcuv'], 0, 2) as $dcuvId) {
            $membres[] = ['id' => $dcuvId, 'role' => 'membre'];
        }
        foreach ($membres as $membre) {
            $insertMembre->execute([
                'commission_id' => $commissionId,
                'user_id' => $membre['id'],
                'role' => $membre['role'],
                'present' => 1,
                'avis' => null
            ]);
        }
    }
    echo "   $nbCommissions commissions créées.\n";

    // ============================================================
    // 6. DECISIONS (pour demandes attribue / non_attribue)
    // ============================================================
    echo "-> Création des décisions...\n";

    $insertDecision = $db->prepare("INSERT INTO decisions (demande_id, directeur_id, decision, motif, date_decision, statut)
        VALUES (:demande_id, :directeur_id, :decision, :motif, :date_decision, :statut)");

    $nbDecisions = 0;
    foreach ($demandeIds as $demandeId) {
        $statut = $demandeStatuts[$demandeId]['statut'];
        if (!in_array($statut, ['attribue', 'non_attribue'])) continue;

        $decision = $statut === 'attribue' ? 'attribue' : 'non_attribue';
        $insertDecision->execute([
            'demande_id' => $demandeId,
            'directeur_id' => $directeurId,
            'decision' => $decision,
            'motif' => $decision === 'attribue' ? 'Dossier complet et conforme aux critères d\'attribution du COUD.' : 'Dossier incomplet ou non conforme aux exigences réglementaires du site VCN.',
            'date_decision' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 25) . ' days')),
            'statut' => 'notifiee'
        ]);
        $nbDecisions++;
    }
    echo "   $nbDecisions décisions créées.\n";

    // ============================================================
    // 7. CONTRATS (pour demandes attribue avec local)
    // ============================================================
    echo "-> Création des contrats...\n";

    $insertContrat = $db->prepare("INSERT INTO contrats (reference, demande_id, local_id, locataire_id, date_debut, date_fin, montant_loyer, periodicite, caution, statut, signe_par_locataire, signe_par_dcuv)
        VALUES (:ref, :demande_id, :local_id, :locataire_id, :date_debut, :date_fin, :montant, :periodicite, :caution, :statut, 1, 1)");

    $contratIds = [];
    $contratInfos = [];
    $numContrat = 1;
    foreach ($demandeIds as $demandeId) {
        $info = $demandeStatuts[$demandeId];
        if ($info['statut'] !== 'attribue' || $info['local_id'] === null) continue;

        $dateDebut = date('Y-m-d', strtotime('-' . rand(30, 200) . ' days'));
        $montantLoyer = rand(15, 80) * 1000;
        $insertContrat->execute([
            'ref' => 'CTR-2026-' . str_pad((string) $numContrat, 4, '0', STR_PAD_LEFT),
            'demande_id' => $demandeId,
            'local_id' => $info['local_id'],
            'locataire_id' => $info['user_id'],
            'date_debut' => $dateDebut,
            'date_fin' => date('Y-m-d', strtotime($dateDebut . ' +1 year')),
            'montant' => $montantLoyer,
            'periodicite' => 'mensuel',
            'caution' => $montantLoyer * 2,
            'statut' => 'actif'
        ]);
        $contratId = (int) $db->lastInsertId();
        $contratIds[] = $contratId;
        $contratInfos[$contratId] = ['date_debut' => $dateDebut, 'montant' => $montantLoyer, 'locataire_id' => $info['user_id'], 'local_id' => $info['local_id']];
        $numContrat++;
    }
    echo "   " . count($contratIds) . " contrats créés.\n";

    // ============================================================
    // 8. ECHEANCES + PAIEMENTS + QUITTANCES
    // ============================================================
    echo "-> Création des échéances, paiements et quittances...\n";

    $insertEcheance = $db->prepare("INSERT INTO echeances (contrat_id, mois, annee, montant_prevu, date_echeance, statut)
        VALUES (:contrat_id, :mois, :annee, :montant, :date_echeance, :statut)");
    $insertPaiement = $db->prepare("INSERT INTO paiements (contrat_id, locataire_id, echeance_id, montant, mode_paiement, date_paiement, enregistre_par, reference_recu, commentaire)
        VALUES (:contrat_id, :locataire_id, :echeance_id, :montant, :mode, :date_paiement, :enregistre_par, :ref, :commentaire)");
    $insertQuittance = $db->prepare("INSERT INTO quittances (paiement_id, reference, montant, periode)
        VALUES (:paiement_id, :ref, :montant, :periode)");

    $modesPaiement = ['especes', 'cheque', 'virement'];
    $nbEcheances = 0;
    $nbPaiements = 0;
    $nbQuittances = 0;
    $recuCounter = 1;
    $quittanceCounter = 1;

    foreach ($contratIds as $contratId) {
        $info = $contratInfos[$contratId];
        $startTs = strtotime($info['date_debut']);
        $nbMois = min(6, (int) ((time() - $startTs) / (30 * 86400)) + 1);
        $nbMois = max(1, $nbMois);

        for ($m = 0; $m < $nbMois; $m++) {
            $moisTs = strtotime("+$m month", $startTs);
            $mois = (int) date('n', $moisTs);
            $annee = (int) date('Y', $moisTs);
            $dateEcheance = date('Y-m-d', $moisTs);
            $estPaye = $m < $nbMois - 1 ? true : (rand(0, 1) === 1);
            $statutEcheance = $estPaye ? 'paye' : (strtotime($dateEcheance) < time() ? 'en_retard' : 'a_venir');

            $insertEcheance->execute([
                'contrat_id' => $contratId,
                'mois' => $mois,
                'annee' => $annee,
                'montant' => $info['montant'],
                'date_echeance' => $dateEcheance,
                'statut' => $statutEcheance
            ]);
            $echeanceId = (int) $db->lastInsertId();
            $nbEcheances++;

            if ($estPaye) {
                $agentRecouvId = $userIds['agentRecouv'][array_rand($userIds['agentRecouv'])];
                $refRecu = 'RECU-2026-' . str_pad((string) $recuCounter, 5, '0', STR_PAD_LEFT);
                $recuCounter++;

                $insertPaiement->execute([
                    'contrat_id' => $contratId,
                    'locataire_id' => $info['locataire_id'],
                    'echeance_id' => $echeanceId,
                    'montant' => $info['montant'],
                    'mode' => $modesPaiement[array_rand($modesPaiement)],
                    'date_paiement' => date('Y-m-d H:i:s', strtotime($dateEcheance . ' +' . rand(0, 5) . ' days')),
                    'enregistre_par' => $agentRecouvId,
                    'ref' => $refRecu,
                    'commentaire' => 'Paiement du loyer mensuel - Site VCN'
                ]);
                $paiementId = (int) $db->lastInsertId();
                $nbPaiements++;

                $refQuittance = 'QUIT-2026-' . str_pad((string) $quittanceCounter, 5, '0', STR_PAD_LEFT);
                $quittanceCounter++;
                $insertQuittance->execute([
                    'paiement_id' => $paiementId,
                    'ref' => $refQuittance,
                    'montant' => (string) $info['montant'],
                    'periode' => sprintf('%02d/%04d', $mois, $annee)
                ]);
                $nbQuittances++;
            }
        }
    }
    echo "   $nbEcheances échéances, $nbPaiements paiements, $nbQuittances quittances créés.\n";

    // ============================================================
    // 9. INCIDENTS + INTERVENTIONS
    // ============================================================
    echo "-> Création des incidents et interventions...\n";

    $insertIncident = $db->prepare("INSERT INTO incidents (reference, locataire_id, local_id, contrat_id, type_incident, description, urgence, statut, prise_en_charge_crous, date_signalement, technicien_id)
        VALUES (:ref, :locataire_id, :local_id, :contrat_id, :type, :description, :urgence, :statut, :prise_en_charge, :date_signalement, :technicien_id)");
    $insertIntervention = $db->prepare("INSERT INTO interventions (incident_id, technicien_id, date_intervention, diagnostic, action_realisee, duree_minutes, resultat, statut)
        VALUES (:incident_id, :technicien_id, :date_intervention, :diagnostic, :action, :duree, :resultat, :statut)");

    $typesIncident = ['plomberie', 'electricite', 'structure', 'securite', 'nettoyage', 'autre'];
    $descriptionsIncident = [
        'Fuite d\'eau au niveau du robinet principal',
        'Panne électrique récurrente dans le local',
        'Fissure apparente sur le mur extérieur',
        'Porte d\'entrée endommagée, problème de sécurité',
        'Accumulation de déchets non collectés',
        'Climatiseur en panne depuis plusieurs jours',
        'Court-circuit sur le tableau électrique',
        'Infiltration d\'eau pendant la saison des pluies'
    ];
    $urgences = ['faible', 'normal', 'normal', 'urgent', 'critique'];
    $statutsIncident = ['signale', 'en_attente', 'pris_en_charge', 'en_cours', 'resolu', 'cloture'];

    $incidentIds = [];
    $nbIncidents = min(15, count($contratIds) > 0 ? count($contratIds) + 5 : 10);
    for ($i = 0; $i < $nbIncidents; $i++) {
        $locataireId = $userIds['locataires'][array_rand($userIds['locataires'])];
        $localId = $localIds[array_rand($localIds)];
        $contratId = count($contratIds) > 0 && rand(0, 1) ? $contratIds[array_rand($contratIds)] : null;
        $statut = $statutsIncident[array_rand($statutsIncident)];
        $technicienId = in_array($statut, ['pris_en_charge', 'en_cours', 'resolu', 'cloture']) ? $userIds['techniciens'][array_rand($userIds['techniciens'])] : null;

        $insertIncident->execute([
            'ref' => 'INC-2026-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
            'locataire_id' => $locataireId,
            'local_id' => $localId,
            'contrat_id' => $contratId,
            'type' => $typesIncident[array_rand($typesIncident)],
            'description' => $descriptionsIncident[array_rand($descriptionsIncident)],
            'urgence' => $urgences[array_rand($urgences)],
            'statut' => $statut,
            'prise_en_charge' => in_array($statut, ['pris_en_charge', 'en_cours', 'resolu', 'cloture']) ? 1 : 0,
            'date_signalement' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 60) . ' days')),
            'technicien_id' => $technicienId
        ]);
        $incidentId = (int) $db->lastInsertId();
        $incidentIds[] = $incidentId;

        if ($technicienId !== null) {
            $statutIntervention = $statut === 'en_cours' ? 'en_cours' : ($statut === 'resolu' || $statut === 'cloture' ? 'terminee' : 'planifiee');
            $insertIntervention->execute([
                'incident_id' => $incidentId,
                'technicien_id' => $technicienId,
                'date_intervention' => date('Y-m-d H:i:s', strtotime('-' . rand(0, 30) . ' days')),
                'diagnostic' => 'Diagnostic effectué sur site, problème confirmé au niveau du local.',
                'action' => $statutIntervention === 'terminee' ? 'Réparation effectuée avec remplacement des pièces défectueuses.' : null,
                'duree' => $statutIntervention === 'terminee' ? rand(30, 180) : null,
                'resultat' => $statutIntervention === 'terminee' ? 'Problème résolu, local remis en état.' : null,
                'statut' => $statutIntervention
            ]);
        }
    }
    echo "   " . count($incidentIds) . " incidents créés avec interventions associées.\n";

    // ============================================================
    // 10. CONTROLES QHSE + SANCTIONS
    // ============================================================
    echo "-> Création des contrôles QHSE et sanctions...\n";

    $insertControle = $db->prepare("INSERT INTO controles_qhse (reference, local_id, controleur_id, date_controle, type_controle, score_proprete, score_securite, score_entretien, score_global, observations, statut)
        VALUES (:ref, :local_id, :controleur_id, :date_controle, :type, :proprete, :securite, :entretien, :global, :observations, :statut)");
    $insertSanction = $db->prepare("INSERT INTO sanctions (reference, locataire_id, local_id, controle_id, type_sanction, motif, description, date_sanction, date_debut, statut, cree_par)
        VALUES (:ref, :locataire_id, :local_id, :controle_id, :type, :motif, :description, :date_sanction, :date_debut, :statut, :cree_par)");

    $typesControle = ['periodique', 'signalement', 'fin_bail', 'pre_affectation'];
    $controleIds = [];
    for ($i = 1; $i <= 12; $i++) {
        $localId = $localIds[array_rand($localIds)];
        $controleurId = $userIds['dcuv'][array_rand($userIds['dcuv'])];
        $scoreProprete = rand(40, 100);
        $scoreSecurite = rand(40, 100);
        $scoreEntretien = rand(40, 100);
        $scoreGlobal = (int) round(($scoreProprete + $scoreSecurite + $scoreEntretien) / 3);

        $insertControle->execute([
            'ref' => 'QHSE-2026-' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
            'local_id' => $localId,
            'controleur_id' => $controleurId,
            'date_controle' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 90) . ' days')),
            'type' => $typesControle[array_rand($typesControle)],
            'proprete' => $scoreProprete,
            'securite' => $scoreSecurite,
            'entretien' => $scoreEntretien,
            'global' => $scoreGlobal,
            'observations' => 'Contrôle effectué sur le local ' . 'du site VCN. Score global obtenu: ' . $scoreGlobal . '/100.',
            'statut' => 'termine'
        ]);
        $controleIds[] = (int) $db->lastInsertId();
    }
    echo "   " . count($controleIds) . " contrôles QHSE créés.\n";

    $typesSanction = ['avertissement', 'mise_en_demeure', 'penalite_financiere'];
    $motifsSanction = [
        'Non-respect des normes d\'hygiène et de propreté du local',
        'Retard répété dans le paiement du loyer mensuel',
        'Non-conformité aux règles de sécurité incendie',
        'Occupation non autorisée d\'un espace commun'
    ];
    $nbSanctions = 0;
    foreach (array_slice($contratIds, 0, min(6, count($contratIds))) as $contratId) {
        if (rand(0, 1) === 0) continue;
        $info = $contratInfos[$contratId];
        $controleId = $controleIds[array_rand($controleIds)];
        $dcuvId = $userIds['dcuv'][array_rand($userIds['dcuv'])];

        $insertSanction->execute([
            'ref' => 'SANC-2026-' . str_pad((string) ($nbSanctions + 1), 4, '0', STR_PAD_LEFT),
            'locataire_id' => $info['locataire_id'],
            'local_id' => $info['local_id'],
            'controle_id' => $controleId,
            'type' => $typesSanction[array_rand($typesSanction)],
            'motif' => $motifsSanction[array_rand($motifsSanction)],
            'description' => 'Sanction émise suite à un contrôle QHSE effectué sur le site VCN.',
            'date_sanction' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 40) . ' days')),
            'date_debut' => date('Y-m-d', strtotime('-' . rand(1, 40) . ' days')),
            'statut' => 'active',
            'cree_par' => $dcuvId
        ]);
        $nbSanctions++;
    }
    echo "   $nbSanctions sanctions créées.\n";

    // ============================================================
    // 11. NOTIFICATIONS
    // ============================================================
    echo "-> Création des notifications...\n";

    $insertNotif = $db->prepare("INSERT INTO notifications (user_id, type, titre, message, lu)
        VALUES (:user_id, :type, :titre, :message, :lu)");

    $notifTemplates = [
        ['demande', 'Demande soumise', 'Votre demande de local a été soumise avec succès.'],
        ['contrat', 'Contrat signé', 'Votre contrat de location a été signé et activé.'],
        ['paiement', 'Paiement enregistré', 'Un paiement de loyer a été enregistré sur votre compte.'],
        ['incident', 'Incident signalé', 'Votre signalement d\'incident a été bien reçu par nos équipes.'],
        ['sanction', 'Sanction émise', 'Une sanction a été émise concernant votre local.'],
    ];

    $nbNotifications = 0;
    foreach ($userIds['locataires'] as $locataireId) {
        $nbNotifsUser = rand(1, 3);
        for ($n = 0; $n < $nbNotifsUser; $n++) {
            [$type, $titre, $message] = $notifTemplates[array_rand($notifTemplates)];
            $insertNotif->execute([
                'user_id' => $locataireId,
                'type' => $type,
                'titre' => $titre,
                'message' => $message,
                'lu' => rand(0, 1)
            ]);
            $nbNotifications++;
        }
    }
    echo "   $nbNotifications notifications créées.\n";

    // ============================================================
    // 12. COURRIERS
    // ============================================================
    echo "-> Création des courriers...\n";

    $insertCourrier = $db->prepare("INSERT INTO courriers (demande_id, destinataire_id, expediteur_id, type_courrier, objet, contenu, statut, reference, date_envoi)
        VALUES (:demande_id, :destinataire_id, :expediteur_id, :type, :objet, :contenu, :statut, :ref, :date_envoi)");

    $typesCourrier = ['demande_complements', 'notification_instruction', 'invitation_commission', 'notification_decision', 'relance'];
    $statutsCourrier = ['en_attente', 'envoye', 'recu', 'lu'];
    $nbCourriers = 0;
    foreach (array_slice($demandeIds, 0, 12) as $demandeId) {
        $info = $demandeStatuts[$demandeId];
        $expediteurId = $userIds['agentCourrier'][array_rand($userIds['agentCourrier'])];
        $type = $typesCourrier[array_rand($typesCourrier)];
        $statut = $statutsCourrier[array_rand($statutsCourrier)];

        $insertCourrier->execute([
            'demande_id' => $demandeId,
            'destinataire_id' => $info['user_id'],
            'expediteur_id' => $expediteurId,
            'type' => $type,
            'objet' => 'Concernant votre demande sur le site VCN',
            'contenu' => 'Nous vous informons que votre dossier fait l\'objet d\'un suivi administratif dans le cadre de la gestion du site VCN, Dakar.',
            'statut' => $statut,
            'ref' => 'COUR-2026-' . str_pad((string) ($nbCourriers + 1), 4, '0', STR_PAD_LEFT),
            'date_envoi' => $statut !== 'en_attente' ? date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days')) : null
        ]);
        $nbCourriers++;
    }
    echo "   $nbCourriers courriers créés.\n";

    $db->commit();

    echo "\n=== Seed terminé avec succès ! ===\n";
    echo "Compte admin: admin@crous-t.sn / password123\n";
    echo "Compte directeur: directeur@crous-t.sn / password123\n";
    echo "Compte DCUV: dcuv1@crous-t.sn / password123\n";
    echo "Compte technicien: technicien1@crous-t.sn / password123\n";
    echo "Compte agent recouvrement: recouvrement1@crous-t.sn / password123\n";
    echo "Compte agent courrier: courrier1@crous-t.sn / password123\n";
    echo "Comptes locataires: voir table utilisateurs (role='locataire') / password123\n";

} catch (\Throwable $e) {
    $db->rollBack();
    echo "\nERREUR durant le seed: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
