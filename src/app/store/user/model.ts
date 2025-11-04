import { Message } from "primeng/api";
import { Profil } from "../profil/model";

export interface User {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
  aeroport?: string;
  statut?: string;
  desactive?: boolean;
  
  profil?: Profil;
  activated?: boolean;
  login?: string;
}

