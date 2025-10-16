export interface Aeroport {
    id: number;
    nom_aeroport: string;
    ville: string;
    pays: string;
    statut: 'ACTIF' | 'INACTIF' | 'MAINTENANCE';
    cree_par: string;
    supprime: boolean;
    date_creation: string;
    date_modification: string | null;
}