import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { Pays } from "../pays/model";
import { Statut, StatutAeroport } from "../global-config/model";

export interface Compagnie {
  id?: number;

  nomCompagine?: string;

  statut?: Statut;

  groupe?: string;

  siege?: string;

  contact?: string;

  email?: string;

  adresseSiege?: string;

  pays?: string;

  nomResponsable?: string;

  prenomResponsable?: string;
  nationaliteResponsable?: string;

  telephoneResponsable?: string;

  mailResponsable?: string;
}

export interface CompagnieList {
  compagnies: Compagnie[];
  selectedCompagnie: Compagnie | null;
  loading: boolean;
  error: string | null;
}

