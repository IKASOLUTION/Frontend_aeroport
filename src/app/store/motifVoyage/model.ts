import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { Statut, StatutAeroport } from "../global-config/model";

export interface MotifVoyage {
    id?: number;
    code?: string;
    libelle?: string;
   
}

export interface MotifVoyageList {
  motifVoyages: MotifVoyage[];
  selectedMotifVoyage: MotifVoyage | null;
  loading: boolean;
  error: string | null;
}

