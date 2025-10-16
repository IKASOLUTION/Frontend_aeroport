export interface Enregistrement {
    id: number;
    voyageur: string;
    vol: string;
    statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ANNULE';
    date_creation: string;
}
