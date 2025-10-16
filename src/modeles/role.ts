export interface Role {
  id: number;
  nom_role: string;
  description: string | null;
  niveau_acces: number;
  statut: 'ACTIF' | 'INACTIF';
  cree_par: string;
  supprime: boolean;
  date_creation: string;
  date_modification: string | null;
}