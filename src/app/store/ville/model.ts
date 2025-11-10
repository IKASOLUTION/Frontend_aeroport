import { Pays } from "../pays/model";

export interface Ville {
  id?: number;
  nom?: string;
  pays?: string;
  
}

export interface VilleList {
  villes: Ville[];
  selectedVille: Ville | null;
  loading: boolean;
  error: string | null;
}
