export interface PersonneListeNoire {
    id: number;
    nom_famille: string;
    prenom: string;
    date_naissance: string;
    lieu_naissance: string;
    motif_interdiction: string;
    photo_profil: string | null;
    donnees_biometriques_id: string | null;
    statut: 'ACTIVE' | 'LEVEE';
    cree_par: string;
    supprime: boolean;
    date_creation: string;
    date_modification: string | null;
}
