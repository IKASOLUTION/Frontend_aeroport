import { Enregistrement } from "./model";
export interface EnregistrementState {
    enregistrements: Array<Enregistrement>;
    voyageurAttentes: Array<Enregistrement>;
    enregistrement: Enregistrement;
    loading: boolean;
    error: string | null;
    totalItems: number;
   

}