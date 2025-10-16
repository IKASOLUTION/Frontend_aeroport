export type TypeDonneeBiometrique = 'EMPREINTE_MAIN_GAUCHE' | 'EMPREINTE_MAIN_DROITE' | 'EMPREINTE_POUCES' | 'VISAGE';

export interface DonneeBiometrique {
    id: number;
    voyageur: string;
    numero_document: string;
    type_donnee: TypeDonneeBiometrique;
    date_capture: string;
    donnee?: string; // Pour stocker la photo en base64
}