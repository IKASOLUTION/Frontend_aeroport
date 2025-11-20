import {  InformationPersonnelle, StatutDonneeBio, TypeCapture } from "../enregistrement/model";

export interface DonneeBiometrique {
  id?: number;
  empreinteDroite1?: boolean;
  empreinteGauche1?: boolean;
  empreintePouces1?: boolean;
  informationPersonnelleId?: number;
 empreinteGauche:File,
  empreinteDroite: File,
  empreintePouces: File,
  photoBiometrique?: File | null;
  informationPersonnelle?: InformationPersonnelle;
  typeCapture?:TypeCapture;
   statut?: StatutDonneeBio;


}


export interface DonneeBiometriqueList {
  profils: DonneeBiometrique[];
  selectedDonneeBiometrique: DonneeBiometrique | null;
  loading: boolean;
  error: string | null;
}
