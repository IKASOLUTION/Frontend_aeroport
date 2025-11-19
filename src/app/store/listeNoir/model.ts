import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { Statut, StatutAeroport } from "../global-config/model";

export interface ListeNoire {
    id?: number;
    nom?: string;
    prenom?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    motif?: string;
    statut?: Statut;
   numeroNip?: string;
   numeroCnib?: string
}

export interface ListeNoireList {
  aeroports: ListeNoire[];
  selectedListeNoire: ListeNoire | null;
  loading: boolean;
  error: string | null;
}

