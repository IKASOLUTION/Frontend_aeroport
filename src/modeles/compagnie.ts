export interface Compagnie {
    id: number;
    nom_compagnie: string;
    pays_compagnie: string;
    statut: 'ACTIVE' | 'INACTIVE' | 'SUSPENDUE';
    cree_par: string;
    supprime: boolean;
    date_creation: string;
    date_modification: string | null;
}