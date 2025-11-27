import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { StatutAeroport, TypeAeroport } from "../global-config/model";

export interface Aeroport {
    id?: number;
    nomAeroport?: string;
    villeId?: number;  // ✅ Ajoutez cette propriété
    ville?: Ville;   // Pour l'affichage uniquement
    pays?: string;
    statutAeroport?: StatutAeroport;
    mailResponsable?: string;
    adresse?: string;
    nomResponsable?: string;
    prenomResponsable?: string;
    code_oaci?: string;
    siteWeb?: string;
    telephone?: string;
    telephoneResponsable?: string;
    typeAeroport?: TypeAeroport;

    latitude?: number; 
    longitude?: number; 
}

export interface AeroportList {
  aeroports: Aeroport[];
  selectedAeroport: Aeroport | null;
  loading: boolean;
  error: string | null;
}

