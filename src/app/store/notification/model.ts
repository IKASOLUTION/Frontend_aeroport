import { Message } from "primeng/api";
import { Profil } from "../profil/model";
import { Ville } from "../ville/model";
import { Statut, StatutAeroport } from "../global-config/model";
import { User } from "../user/model";
import { A } from "@fullcalendar/core/internal-common";
import { Aeroport } from "../aeroport/model";

export interface Notification {
    id?: number;
    libelle?: string;
    nom?: string;
    prenom?: string;
    numeroNip?: string;
    numeroCnib?: string;
    dateNaissance?: Date;
    lieuNaissance?: string;
    statut?:Statut;
    dateNotification?: Date;
    user?: User;
    aeroport?: Aeroport;
   
}
export interface NotificationList {
  notifications: Notification[];
  selectedNotification: Notification | null;
  loading: boolean;
  error: string | null;
}


