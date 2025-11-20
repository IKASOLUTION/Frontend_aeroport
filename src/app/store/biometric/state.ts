import { DonneeBiometrique } from "./model";
export interface DonneeBiometriqueState {
    donneeBiometriques: Array<DonneeBiometrique>;
     loading: boolean;
    error: string | null;
    totalItems: number;
   

}