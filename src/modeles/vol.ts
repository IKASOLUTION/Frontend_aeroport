export interface Vol {
    id: number;
    compagnie_id: number;
    aeroport_id: number;
    numero_vol: string;
    ville_depart: string;
    ville_arrivee: string;
    date_depart: string; // DATETIME
    date_arrivee: string; // DATETIME
    statut: 'PROGRAMME' | 'CONFIRME' | 'ANNULE' | 'RETARDE';
    type_vol: 'ARRIVEE' | 'DEPART';
    cree_par: string;
    supprime: boolean;
    date_creation: string;
    date_modification: string | null;
}
