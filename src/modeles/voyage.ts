export interface Voyage {
  id: number;
  numero_vol: string;
  numero_enregistrement: string;
  nom_passager: string;
  prenom_passager: string;
  etat_voyage: 'Arrivé' | 'Départ';
  date_voyage: string; // Format DD/MM/YYYY
  heure_voyage: string; // Format HH:mm
  ville_depart: string;
  ville_destination: string;
  motif_voyage: 'Religion' | 'Affaire' | 'Études' | 'Tourisme' | 'Famille' | 'Medical';
  duree_sejour: number; // en jours
  statut: 'Validé' | 'En attente' | 'Rejeté';
  date_creation: string; // Format DD/MM/YYYY à HH:mm
  id_unique_passager: string;
  nom_aeroport: string;
}
