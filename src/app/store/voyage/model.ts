import { Aeroport } from "../aeroport/model";
import { Statut } from "../global-config/model";
import { EtatVoyage, MotifVoyage } from "../motifVoyage/model";
import { Pays } from "../pays/model";
import { Ville } from "../ville/model";
import { Vol } from "../vol/model";

export interface Voyage {
  id?: number;
  villeDepart?:Ville;
  villeDestination?:Ville;
  motifVoyage?: MotifVoyage;
  dateVoyage?: Date;
  heureVoyage?: string;
  EtatVoyage?: EtatVoyage;
  dureeSejour?: number;
  StatutVoyage?: Statut;
  vol?: Vol;
  aeroport?: Aeroport; 
}

export interface VoyageList {
  voyages: Voyage[];
  selectedVoyage: Voyage | null;
  loading: boolean;
  error: string | null;
}
