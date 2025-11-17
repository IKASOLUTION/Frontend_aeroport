import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { Aeroport } from "../aeroport/model";
import { Compagnie } from "../compagnie/model";
import { StatutVoyageur } from "../motifVoyage/model";

export interface Vol {
  id?: number;
  numero?: string;
  villeDepart?: Ville;
  villeArrivee?: Ville;
  typeVol?: TypeVol;
  compagnieId?: number;
  aeroportId?: number;
  compagnie?: Compagnie;
  aeroport?: Aeroport;
  villeDepartId?: number;
  villeArriveeId?: number;
  dateDepart?: Date;
  dateArrivee?: Date;
  statut?: StatutVol;
  dateSaisie?: Date;
  villeNomD?: string;
  villeNomA?: string;
  type?: string;
  statutLibelle?: string;
}

export interface VolList {
  vols: Vol[];
  selectedVol: Vol | null;
  loading: boolean;
  error: string | null;
}



export enum TypeVol {
  ARRIVEE, DEPART  // Définir vos valeurs ici
}

export enum StatutVol {
  PROGRAMME, CONFIRME, ANNULE, RETARDE, EFFECTUE
  // Définir vos valeurs ici
}

export interface SearchDto {
    dateDebut: Date;
    dateFin: Date;
    statutVols?: StatutVol[];
    status?: StatutVoyageur[],
    aeroportId?: number;
    motifVoyageId?: number;
    page?: number;
    size?: number;
    sortBy?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}