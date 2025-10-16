export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  aeroport: string;
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  date_creation: string;
  desactive: boolean;
  date_desactivation: string | null;
  cree_par: string;
  date_modification: string | null;
}