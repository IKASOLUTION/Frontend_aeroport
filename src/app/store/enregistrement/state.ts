import { Enregistrement } from "./model";
export interface EnregistrementState {
    enregistrements: Array<Enregistrement>;
    voyageurAttentes: Array<Enregistrement>;
    preEnregistrements: Array<Enregistrement>;
    enregistrement: Enregistrement;
    loading: boolean;
    error: string | null;
    totalItems: number;
   

}