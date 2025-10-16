export interface MotifVoyage {
  id: number;
  libelle: string;
  description: string | null;
  statut: 'ACTIF' | 'INACTIF';
  cree_par: string;
  supprime: boolean;
  date_creation: string;
  date_modification: string | null;
}