import { Injectable } from '@angular/core';
import { Utilisateur } from '../modeles/utilisateur';
import { Enregistrement } from '../modeles/enregistrement';
import { Vol } from '../modeles/vol';
import { Compagnie } from '../modeles/compagnie';
import { Aeroport } from '../modeles/aeroport';
import { PersonneListeNoire } from '../modeles/liste-noire';
import { ActionHistorique } from '../modeles/historique';
import { Role } from '../modeles/role';
import { MotifVoyage } from '../modeles/motif-voyage';
import { DonneeBiometrique } from '../modeles/donnee-biometrique';
import { Voyage } from '../modeles/voyage';
import { Alerte } from '../modeles/alerte';
import { VoyageurAttente } from '../modeles/voyageur-attente';
import { Passager } from '../modeles/passager';

@Injectable({
  providedIn: 'root',
})
export class DonneesService {

  private utilisateurs: Utilisateur[] = [
    { id: 1, nom: 'KABORE', prenom: 'Adama', email: 'adama.kabore@police.bf', role: 'Administrateur', aeroport: 'Aéroport de Ouagadougou', statut: 'ACTIF', date_creation: '2023-01-15', desactive: false, date_desactivation: null, cree_par: 'Ibrahim TRAORE', date_modification: '2024-05-20' },
    { id: 2, nom: 'OUEDRAOGO', prenom: 'Fatoumata', email: 'fatou.ouedraogo@police.bf', role: 'Agent', aeroport: 'Aéroport de Ouagadougou', statut: 'ACTIF', date_creation: '2023-02-20', desactive: false, date_desactivation: null, cree_par: 'Adama KABORE', date_modification: null },
    { id: 3, nom: 'SANON', prenom: 'Moussa', email: 'moussa.sanon@gmail.com', role: 'Voyageur', aeroport: 'N/A', statut: 'INACTIF', date_creation: '2023-03-05', desactive: true, date_desactivation: '2024-01-10', cree_par: 'Adama KABORE', date_modification: '2024-01-10' },
    { id: 4, nom: 'BAMBARA', prenom: 'Aïcha', email: 'aicha.bambara@police.bf', role: 'Agent', aeroport: 'Aéroport de Bobo-Dioulasso', statut: 'SUSPENDU', date_creation: '2023-04-10', desactive: true, date_desactivation: '2024-06-01', cree_par: 'Adama KABORE', date_modification: '2024-06-01' },
    { id: 5, nom: 'TRAORE', prenom: 'Ibrahim', email: 'ib.traore@gov.bf', role: 'Super Administrateur', aeroport: 'Tous', statut: 'ACTIF', date_creation: '2023-01-01', desactive: false, date_desactivation: null, cree_par: 'Système', date_modification: '2023-01-01' },
    { id: 6, nom: 'BATIONO', prenom: 'Karim', email: 'k.bationo@police.bf', role: 'Agent', aeroport: 'Aéroport de Ouagadougou', statut: 'ACTIF', date_creation: '2022-11-10', desactive: false, date_desactivation: null, cree_par: 'Adama KABORE', date_modification: '2024-03-15' },
  ];

  private enregistrements: Enregistrement[] = [
      { id: 101, voyageur: 'SANON Moussa', vol: '2J513', statut: 'VALIDE', date_creation: '2024-05-01' },
      { id: 102, voyageur: 'DIALLO Aminata', vol: 'TK537', statut: 'EN_ATTENTE', date_creation: '2024-05-10' },
      { id: 103, voyageur: 'COULIBALY David', vol: 'AF513', statut: 'REJETE', date_creation: '2024-05-12' },
      { id: 104, voyageur: 'ZERBO Alima', vol: '2J513', statut: 'ANNULE', date_creation: '2024-05-15' },
      { id: 105, voyageur: 'SAWADOGO Paul', vol: 'AF513', statut: 'EN_ATTENTE', date_creation: '2024-05-18' },
  ];
  
  private vols: Vol[] = [
      { id: 1, compagnie_id: 1, aeroport_id: 1, numero_vol: '2J513', ville_depart: 'Ouagadougou', ville_arrivee: 'Abidjan', date_depart: '2024-07-25T08:00', date_arrivee: '2024-07-25T09:30', statut: 'PROGRAMME', type_vol: 'DEPART', cree_par: 'Adama KABORE', supprime: false, date_creation: '2024-06-10', date_modification: null },
      { id: 2, compagnie_id: 2, aeroport_id: 1, numero_vol: 'AF513', ville_depart: 'Paris', ville_arrivee: 'Ouagadougou', date_depart: '2024-07-25T10:30', date_arrivee: '2024-07-25T16:00', statut: 'CONFIRME', type_vol: 'ARRIVEE', cree_par: 'Système', supprime: false, date_creation: '2024-06-01', date_modification: '2024-07-20' },
      { id: 3, compagnie_id: 3, aeroport_id: 1, numero_vol: 'TK537', ville_depart: 'Istanbul', ville_arrivee: 'Ouagadougou', date_depart: '2024-07-26T13:00', date_arrivee: '2024-07-26T18:30', statut: 'RETARDE', type_vol: 'ARRIVEE', cree_par: 'Système', supprime: false, date_creation: '2024-05-15', date_modification: '2024-07-21' },
      { id: 4, compagnie_id: 4, aeroport_id: 2, numero_vol: 'KP045', ville_depart: 'Lomé', ville_arrivee: 'Bobo-Dioulasso', date_depart: '2024-07-26T15:00', date_arrivee: '2024-07-26T16:15', statut: 'ANNULE', type_vol: 'DEPART', cree_par: 'Adama KABORE', supprime: true, date_creation: '2024-06-20', date_modification: '2024-07-19' },
  ];

  private compagnies: Compagnie[] = [
      { id: 1, nom_compagnie: 'Air Burkina', pays_compagnie: 'Burkina Faso', statut: 'ACTIVE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2022-01-10', date_modification: '2024-05-20' },
      { id: 2, nom_compagnie: 'Air France', pays_compagnie: 'France', statut: 'ACTIVE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2021-11-20', date_modification: null },
      { id: 3, nom_compagnie: 'Turkish Airlines', pays_compagnie: 'Turquie', statut: 'ACTIVE', cree_par: 'Système', supprime: false, date_creation: '2020-03-15', date_modification: '2024-06-01' },
      { id: 4, nom_compagnie: 'ASKY Airlines', pays_compagnie: 'Togo', statut: 'INACTIVE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2023-08-01', date_modification: '2024-02-10' },
      { id: 5, nom_compagnie: 'Phantom Airways', pays_compagnie: 'N/A', statut: 'SUSPENDUE', cree_par: 'Système', supprime: true, date_creation: '2020-01-01', date_modification: '2023-01-01' },
  ];
  
  private aeroports: Aeroport[] = [
      { id: 1, nom_aeroport: 'Aéroport international de Ouagadougou', ville: 'Ouagadougou', pays: 'Burkina Faso', statut: 'ACTIF', date_creation: '2020-01-01', cree_par: 'Système', date_modification: '2024-01-15', supprime: false },
      { id: 2, nom_aeroport: 'Aéroport de Bobo-Dioulasso', ville: 'Bobo-Dioulasso', pays: 'Burkina Faso', statut: 'ACTIF', date_creation: '2020-01-01', cree_par: 'Système', date_modification: null, supprime: false },
      { id: 3, nom_aeroport: 'Aéroport de Fada N\'gourma', ville: 'Fada N\'gourma', pays: 'Burkina Faso', statut: 'MAINTENANCE', date_creation: '2021-06-10', cree_par: 'Adama KABORE', date_modification: '2024-05-20', supprime: false },
      { id: 4, nom_aeroport: 'Aéroport de Gaoua', ville: 'Gaoua', pays: 'Burkina Faso', statut: 'INACTIF', date_creation: '2022-03-03', cree_par: 'Adama KABORE', date_modification: null, supprime: true },
  ];
  
  private listeNoire: PersonneListeNoire[] = [
      { id: 1, nom_famille: 'COMPAORE', prenom: 'Issouf', date_naissance: '1980-01-01', lieu_naissance: 'Ouagadougou', motif_interdiction: 'Activités terroristes suspectées', photo_profil: 'https://picsum.photos/seed/p1/100', donnees_biometriques_id: 'BIO_001', statut: 'ACTIVE', cree_par: 'Système', supprime: false, date_creation: '2022-01-10', date_modification: null },
      { id: 2, nom_famille: 'SAWADOGO', prenom: 'Amina', date_naissance: '1992-05-20', lieu_naissance: 'Bobo-Dioulasso', motif_interdiction: 'Trafic de stupéfiants', photo_profil: 'https://picsum.photos/seed/p2/100', donnees_biometriques_id: 'BIO_002', statut: 'ACTIVE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2023-05-15', date_modification: '2024-02-20' },
      { id: 3, nom_famille: 'YAMEOGO', prenom: 'Pascal', date_naissance: '1975-11-30', lieu_naissance: 'Koudougou', motif_interdiction: 'Falsification de documents (levée)', photo_profil: 'https://picsum.photos/seed/p3/100', donnees_biometriques_id: 'BIO_003', statut: 'LEVEE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2021-08-01', date_modification: '2023-11-30' },
      { id: 4, nom_famille: 'DIALLO', prenom: 'Mamadou', date_naissance: '1988-07-14', lieu_naissance: 'Dori', motif_interdiction: 'Contrebande de marchandises prohibées.', photo_profil: null, donnees_biometriques_id: 'BIO_004', statut: 'ACTIVE', cree_par: 'Adama KABORE', supprime: false, date_creation: '2024-01-20', date_modification: null },
      { id: 5, nom_famille: 'OUATTARA', prenom: 'Bintou', date_naissance: '1995-03-22', lieu_naissance: 'Banfora', motif_interdiction: 'Violation des lois sur l\'immigration.', photo_profil: 'https://picsum.photos/seed/p5/100', donnees_biometriques_id: null, statut: 'ACTIVE', cree_par: 'Fatoumata OUEDRAOGO', supprime: false, date_creation: '2024-03-11', date_modification: '2024-06-01' },
      { id: 6, nom_famille: 'TRAORE', prenom: 'Ali', date_naissance: '1982-12-05', lieu_naissance: 'Ouahigouya', motif_interdiction: 'Soupçons de liens avec des réseaux criminels.', photo_profil: 'https://picsum.photos/seed/p6/100', donnees_biometriques_id: 'BIO_006', statut: 'ACTIVE', cree_par: 'Système', supprime: false, date_creation: '2023-11-05', date_modification: null },
  ];

  private historique: ActionHistorique[] = [
      { id: 1, utilisateur: 'Adama KABORE', type_action: 'Utilisateur', detail_action: 'Création de l\'utilisateur Aïcha BAMBARA', action: 'CREATE', adresse_ip: '192.168.1.10', date_action: '2024-07-20 10:00' },
      { id: 2, utilisateur: 'Fatoumata OUEDRAOGO', type_action: 'Enregistrement', detail_action: 'Validation de l\'enregistrement #101', action: 'VALIDATE', adresse_ip: '192.168.1.12', date_action: '2024-07-20 10:05' },
      { id: 3, utilisateur: 'Ibrahim TRAORE', type_action: 'Vol', detail_action: 'Mise à jour du statut du vol TK537 à RETARDE', action: 'UPDATE', adresse_ip: '10.0.0.1', date_action: '2024-07-20 11:30' },
      { id: 4, utilisateur: 'Adama KABORE', type_action: 'Utilisateur', detail_action: 'Suspension de l\'utilisateur Aïcha BAMBARA', action: 'UPDATE', adresse_ip: '192.168.1.10', date_action: '2024-07-21 09:00' },
  ];

  private roles: Role[] = [
    { id: 1, nom_role: 'Super Administrateur', description: 'Accès total à toutes les fonctionnalités.', niveau_acces: 6, statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: null },
    { id: 2, nom_role: 'Administrateur', description: 'Gère les utilisateurs, les vols et valide les enregistrements.', niveau_acces: 5, statut: 'ACTIF', cree_par: 'Super Administrateur', supprime: false, date_creation: '2023-01-10', date_modification: '2024-03-10' },
    { id: 3, nom_role: 'Agent', description: 'Crée des enregistrements et consulte les informations des vols.', niveau_acces: 3, statut: 'ACTIF', cree_par: 'Administrateur', supprime: false, date_creation: '2023-01-15', date_modification: null },
    { id: 4, nom_role: 'Voyageur', description: 'Accès limité à ses propres informations de voyage.', niveau_acces: 1, statut: 'INACTIF', cree_par: 'Système', supprime: true, date_creation: '2023-01-01', date_modification: '2024-01-01' }
  ];

  private motifsVoyages: MotifVoyage[] = [
    { id: 1, libelle: 'Tourisme', description: 'Voyage de loisir et de découverte.', statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: null },
    { id: 2, libelle: 'Affaires', description: 'Déplacement professionnel, réunions, conférences.', statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: '2024-02-15' },
    { id: 3, libelle: 'Études', description: 'Voyage pour suivre une formation ou un cursus scolaire.', statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: null },
    { id: 4, libelle: 'Visite Familiale', description: 'Rendre visite à des membres de la famille.', statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: null },
    { id: 5, libelle: 'Traitement Médical', description: 'Voyage pour recevoir des soins médicaux.', statut: 'INACTIF', cree_par: 'Système', supprime: false, date_creation: '2023-01-01', date_modification: '2024-05-30' },
    { id: 6, libelle: 'Transit', description: 'Escale dans le pays avant de rejoindre une autre destination.', statut: 'ACTIF', cree_par: 'Système', supprime: false, date_creation: '2024-03-20', date_modification: null }
  ];

  public empreintePlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  private donneesBiometriques: DonneeBiometrique[] = [
    { id: 1, voyageur: 'SANON Moussa', numero_document: 'BF123456789', type_donnee: 'EMPREINTE_MAIN_GAUCHE', date_capture: '2024-05-01 10:30', donnee: this.empreintePlaceholder },
    { id: 5, voyageur: 'SANON Moussa', numero_document: 'BF123456789', type_donnee: 'EMPREINTE_MAIN_DROITE', date_capture: '2024-05-01 10:30', donnee: this.empreintePlaceholder },
    { id: 6, voyageur: 'SANON Moussa', numero_document: 'BF123456789', type_donnee: 'EMPREINTE_POUCES', date_capture: '2024-05-01 10:30', donnee: this.empreintePlaceholder },
    { id: 2, voyageur: 'SANON Moussa', numero_document: 'BF123456789', type_donnee: 'VISAGE', date_capture: '2024-05-01 10:31', donnee: this.empreintePlaceholder },
    { id: 3, voyageur: 'DIALLO Aminata', numero_document: 'SN0987654321', type_donnee: 'EMPREINTE_MAIN_GAUCHE', date_capture: '2024-05-10 14:00', donnee: this.empreintePlaceholder },
    { id: 4, voyageur: 'COULIBALY David', numero_document: 'BF987654321', type_donnee: 'VISAGE', date_capture: '2024-05-12 08:20', donnee: this.empreintePlaceholder }
  ];

  private voyages: Voyage[] = [
    { 
      id: 1, 
      numero_vol: 'A15', 
      numero_enregistrement: 'LK2933',
      nom_passager: 'YAMEOGO',
      prenom_passager: 'TEGAWENDE MARTIN JUNIOR',
      etat_voyage: 'Arrivé',
      date_voyage: '25/07/2025',
      heure_voyage: '04:08',
      ville_depart: 'OUAGA',
      ville_destination: 'Abidjan',
      motif_voyage: 'Religion',
      duree_sejour: 25,
      statut: 'Validé',
      date_creation: '18/07/2025 à 19:32',
      id_unique_passager: '09010200115052566',
      nom_aeroport: 'Aéroport de Ouagadougou'
    },
    { 
      id: 2, 
      numero_vol: 'A150', 
      numero_enregistrement: 'XSX421',
      nom_passager: 'YAMEOGO',
      prenom_passager: 'TEGAWENDE MARTIN JUNIOR',
      etat_voyage: 'Arrivé',
      date_voyage: '24/09/2026',
      heure_voyage: '05:05',
      ville_depart: 'OUAGA',
      ville_destination: 'Abidjan',
      motif_voyage: 'Affaire',
      duree_sejour: 25,
      statut: 'Validé',
      date_creation: '18/07/2025 à 19:09',
      id_unique_passager: '09010200115052566',
      nom_aeroport: 'Aéroport de Ouagadougou'
    },
    { 
      id: 3, 
      numero_vol: '20hdy', 
      numero_enregistrement: 'YDP743',
      nom_passager: 'DJE',
      prenom_passager: 'LOU ZINAN LOLA ARLETTE',
      etat_voyage: 'Arrivé',
      date_voyage: '29/07/2025',
      heure_voyage: '02:51',
      ville_depart: 'Abidjan',
      ville_destination: 'Ouagadougou',
      motif_voyage: 'Études',
      duree_sejour: 50,
      statut: 'En attente',
      date_creation: '16/07/2025 à 14:51',
      id_unique_passager: 'CI00123456789',
      nom_aeroport: 'Aéroport international Félix-Houphouët-Boigny'
    },
     { 
      id: 4, 
      numero_vol: 'FET731', 
      numero_enregistrement: 'IUM626',
      nom_passager: 'LESAGE',
      prenom_passager: 'FRANCINE',
      etat_voyage: 'Départ',
      date_voyage: '16/07/2025',
      heure_voyage: '09:17',
      ville_depart: 'Ouagadougou',
      ville_destination: 'Bobo-Dioulasso',
      motif_voyage: 'Affaire',
      duree_sejour: 12,
      statut: 'Validé',
      date_creation: '16/07/2025 à 13:55',
      id_unique_passager: 'FR9876543210',
      nom_aeroport: 'Aéroport de Ouagadougou'
    },
    { 
      id: 5, 
      numero_vol: 'FET731', 
      numero_enregistrement: 'LYV913',
      nom_passager: 'OUE',
      prenom_passager: 'SERGE GEDEON',
      etat_voyage: 'Départ',
      date_voyage: '17/07/2025',
      heure_voyage: '17:39',
      ville_depart: 'Ouagadougou',
      ville_destination: 'Bobo-Dioulasso',
      motif_voyage: 'Tourisme',
      duree_sejour: 5,
      statut: 'Validé',
      date_creation: '16/07/2025 à 13:41',
      id_unique_passager: 'CI002476534',
      nom_aeroport: 'Aéroport de Ouagadougou'
    },
    { 
      id: 6, 
      numero_vol: 'BH234', 
      numero_enregistrement: 'QWE567',
      nom_passager: 'OUE',
      prenom_passager: 'SERGE GEDEON',
      etat_voyage: 'Arrivé',
      date_voyage: '10/06/2025',
      heure_voyage: '11:00',
      ville_depart: 'Dakar',
      ville_destination: 'Ouagadougou',
      motif_voyage: 'Affaire',
      duree_sejour: 3,
      statut: 'Validé',
      date_creation: '09/06/2025 à 10:00',
      id_unique_passager: 'CI002476534',
      nom_aeroport: 'Aéroport de Ouagadougou'
    },
    { 
      id: 7, 
      numero_vol: 'FET731', 
      numero_enregistrement: 'ZER543',
      nom_passager: 'YAMEOGO',
      prenom_passager: 'TEGAWENDE MARTIN JUNIOR',
      etat_voyage: 'Arrivé',
      date_voyage: '18/07/2025',
      heure_voyage: '15:49',
      ville_depart: 'Ouagadougou',
      ville_destination: 'Bobo-Dioulasso',
      motif_voyage: 'Famille',
      duree_sejour: 7,
      statut: 'Validé',
      date_creation: '18/07/2025 à 12:00',
      id_unique_passager: '09010200115052566',
      nom_aeroport: 'Aéroport de Ouagadougou'
    }
  ];

  private alertes: Alerte[] = [
    { id: 1, personne_id: 1, personne: 'Issouf COMPAORE', date: '2024-07-22 14:30', aeroport: 'Ouagadougou', urgence: 'Élevée', agent: 'Adama KABORE' },
    { id: 2, personne_id: 2, personne: 'Amina SAWADOGO', date: '2024-07-22 15:00', aeroport: 'Bobo-Dioulasso', urgence: 'Moyenne', agent: 'Aïcha BAMBARA' },
    { id: 3, personne_id: 1, personne: 'Issouf COMPAORE', date: '2024-07-23 16:15', aeroport: 'Ouagadougou', urgence: 'Faible', agent: 'Fatoumata OUEDRAOGO' },
  ];

  private voyageursEnAttente: VoyageurAttente[] = [
    {
      id: 201,
      photo_url: 'https://picsum.photos/seed/va1/100',
      nom_complet: 'DJE LOU ZINAN LOLA ARLETTE',
      pays: "Côte d'Ivoire",
      type_document: "Carte Nationale d'Identité",
      numero_document: 'CI006475497',
      numero_vol: '20hdy',
      numero_enregistrement: 'YDP743',
      ville_depart: 'Abidjan',
      ville_arrivee: 'Ouagadougou',
      statut: 'En attente',
      date_voyage: '2025-07-29',
    },
    {
      id: 202,
      photo_url: 'https://picsum.photos/seed/va2/100',
      nom_complet: 'SAWADOGO Paul',
      pays: 'Burkina Faso',
      type_document: 'Passeport',
      numero_document: 'BF0A1B2C3D',
      numero_vol: 'AF513',
      numero_enregistrement: 'ENR987',
      ville_depart: 'Paris',
      ville_arrivee: 'Ouagadougou',
      statut: 'En attente',
      date_voyage: '2025-08-15',
    },
    {
      id: 203,
      photo_url: 'https://picsum.photos/seed/va3/100',
      nom_complet: 'DIALLO Aminata',
      pays: 'Sénégal',
      type_document: 'Passeport',
      numero_document: 'SN0987654321',
      numero_vol: 'TK537',
      numero_enregistrement: 'ENR654',
      ville_depart: 'Istanbul',
      ville_arrivee: 'Ouagadougou',
      statut: 'En attente',
      date_voyage: '2025-08-20',
    },
  ];

  private passagers: Passager[] = [
    {
      id_unique: '09010200115052566',
      nom: 'YAMEOGO',
      prenom: 'TEGAWENDE MARTIN JUNIOR',
      date_naissance: '04/10/2002',
      nationalite: 'Burkina Faso',
      profession: 'ELEVE',
      lieu_naissance: 'A BOBO-DIOULASSO',
      pays_residence: 'Burkina Faso',
      adresse_etranger: 'PARIS',
      telephone_etranger: '+225 45645612',
      adresse_burkina: 'Ouagadougou',
      telephone_burkina: '+226 74250254',
      email: null,
      type_document: "Carte Nationale d'Identité",
      numero_document: 'B11952283',
      date_delivrance_doc: '17/07/2019',
      lieu_delivrance_doc: 'HOUET, BOBO-DIOULASSO',
      code_empreinte: '111111',
      photo_profil_url: 'https://picsum.photos/seed/p-yameogo/100',
      photo_identite_url: 'https://picsum.photos/seed/id-yameogo/200/300',
      doc_recto_url: 'https://picsum.photos/seed/recto-yameogo/300/200',
      doc_verso_url: 'https://picsum.photos/seed/verso-yameogo/300/200',
      empreinte_gauche_url: 'https://picsum.photos/seed/fg-yameogo/200/200',
      empreinte_droite_url: 'https://picsum.photos/seed/fd-yameogo/200/200',
      empreinte_pouces_url: 'https://picsum.photos/seed/fp-yameogo/200/200',
    },
    {
      id_unique: 'CI00123456789',
      nom: 'DJE',
      prenom: 'LOU ZINAN LOLA ARLETTE',
      date_naissance: '15/05/1998',
      nationalite: "Côte d'Ivoire",
      profession: 'ETUDIANTE',
      lieu_naissance: 'Abidjan',
      pays_residence: "Côte d'Ivoire",
      adresse_etranger: 'Non renseigné',
      telephone_etranger: '+225 01020304',
      adresse_burkina: 'Cité Universitaire, Ouagadougou',
      telephone_burkina: '+226 65432100',
      email: 'lola.dje@email.com',
      type_document: "Carte Nationale d'Identité",
      numero_document: 'CI006475497',
      date_delivrance_doc: '10/01/2022',
      lieu_delivrance_doc: 'Abidjan',
      code_empreinte: '222222',
      photo_profil_url: 'https://picsum.photos/seed/p-dje/100',
      photo_identite_url: 'https://picsum.photos/seed/id-dje/200/300',
      doc_recto_url: 'https://picsum.photos/seed/recto-dje/300/200',
      doc_verso_url: 'https://picsum.photos/seed/verso-dje/300/200',
      empreinte_gauche_url: 'https://picsum.photos/seed/fg-dje/200/200',
      empreinte_droite_url: 'https://picsum.photos/seed/fd-dje/200/200',
      empreinte_pouces_url: 'https://picsum.photos/seed/fp-dje/200/200',
    },
    {
      id_unique: 'FR9876543210',
      nom: 'LESAGE',
      prenom: 'FRANCINE',
      date_naissance: '20/11/1985',
      nationalite: 'France',
      profession: 'COMMERCIALE',
      lieu_naissance: 'Lyon',
      pays_residence: 'France',
      adresse_etranger: '12 Rue de la République, Lyon',
      telephone_etranger: '+33 612345678',
      adresse_burkina: 'Hôtel Splendid, Ouagadougou',
      telephone_burkina: 'Non renseigné',
      email: 'francine.lesage@email.com',
      type_document: "Passeport",
      numero_document: 'B11952283',
      date_delivrance_doc: '05/03/2021',
      lieu_delivrance_doc: 'Paris',
      code_empreinte: '333333',
      photo_profil_url: 'https://picsum.photos/seed/p-lesage/100',
      photo_identite_url: 'https://picsum.photos/seed/id-lesage/200/300',
      doc_recto_url: 'https://picsum.photos/seed/recto-lesage/300/200',
      doc_verso_url: 'https://picsum.photos/seed/verso-lesage/300/200',
      empreinte_gauche_url: 'https://picsum.photos/seed/fg-lesage/200/200',
      empreinte_droite_url: 'https://picsum.photos/seed/fd-lesage/200/200',
      empreinte_pouces_url: 'https://picsum.photos/seed/fp-lesage/200/200',
    },
    {
      id_unique: 'CI002476534',
      nom: 'OUE',
      prenom: 'SERGE GEDEON',
      date_naissance: '01/02/1990',
      nationalite: "Côte d'Ivoire",
      profession: 'INGENIEUR',
      lieu_naissance: 'Yamoussoukro',
      pays_residence: "Côte d'Ivoire",
      adresse_etranger: 'Non renseigné',
      telephone_etranger: '+225 98765432',
      adresse_burkina: 'Ouaga 2000',
      telephone_burkina: '+226 50403020',
      email: 'serge.oue@email.com',
      type_document: "Passeport",
      numero_document: 'CI002476534',
      date_delivrance_doc: '22/07/2020',
      lieu_delivrance_doc: 'Abidjan',
      code_empreinte: '444444',
      photo_profil_url: 'https://picsum.photos/seed/p-oue/100',
      photo_identite_url: 'https://picsum.photos/seed/id-oue/200/300',
      doc_recto_url: 'https://picsum.photos/seed/recto-oue/300/200',
      doc_verso_url: 'https://picsum.photos/seed/verso-oue/300/200',
      empreinte_gauche_url: 'https://picsum.photos/seed/fg-oue/200/200',
      empreinte_droite_url: 'https://picsum.photos/seed/fd-oue/200/200',
      empreinte_pouces_url: 'https://picsum.photos/seed/fp-oue/200/200',
    },
  ];

  getUtilisateurs = () => this.utilisateurs;
  getEnregistrements = () => this.enregistrements;
  getVols = () => this.vols;
  getCompagnies = () => this.compagnies;
  getAeroports = () => this.aeroports;
  getListeNoire = () => this.listeNoire;
  getHistorique = () => this.historique;
  getRoles = () => this.roles;
  getMotifsVoyages = () => this.motifsVoyages;
  getDonneesBiometriques = () => this.donneesBiometriques;
  getVoyages = () => this.voyages;
  getAlertes = () => this.alertes;
  getVoyageursEnAttente = () => this.voyageursEnAttente;
  getPassagers = () => this.passagers;
}