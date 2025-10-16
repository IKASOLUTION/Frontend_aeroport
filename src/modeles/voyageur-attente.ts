export interface VoyageurAttente {
  id: number;
  photo_url: string;
  nom_complet: string;
  pays: string;
  type_document: string;
  numero_document: string;
  numero_vol: string;
  numero_enregistrement: string;
  ville_depart: string;
  ville_arrivee: string;
  statut: 'En attente';
  date_voyage: string; // Format YYYY-MM-DD for filtering
}
