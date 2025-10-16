export interface Alerte {
    id: number;
    personne_id: number;
    personne: string;
    date: string;
    aeroport: string;
    urgence: 'Élevée' | 'Moyenne' | 'Faible';
    agent: string;
}