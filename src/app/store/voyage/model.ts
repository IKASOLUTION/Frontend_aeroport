import { Aeroport } from "../aeroport/model";
import { Statut, StatutVoyage } from "../global-config/model";
import { EtatVoyage, MotifVoyage } from "../motifVoyage/model";
import { Pays } from "../pays/model";
import { Ville } from "../ville/model";
import { Vol } from "../vol/model";

export interface Voyage {
  id?: number;
  villeDepart?: Ville;
  villeDestination?: Ville;
  motifVoyage?: MotifVoyage;
  dateVoyage?: Date;
  heureVoyage?: string;
  etatVoyage?: EtatVoyage;
  dureeSejour?: number;
  statut?: StatutVoyage;
  vol?: Vol;
  nomVoyageur?: string;
  prenomVoyageur?: string;
  aeroport?: Aeroport;
  villeNomD?: string;
  villeNomA?: string;
  aeroportForUser?: Aeroport;
  
  // AJOUTER CES CHAMPS MANQUANTS QUI SONT DANS VOTRE DTO BACKEND
  nomAgentConnecteAeroport?: string;
  aeroportId?: number;
  aeroportForUserId?: number;
}


export interface VoyageList {
  voyages: Voyage[];
  selectedVoyage: Voyage | null;
  loading: boolean;
  error: string | null;
}
