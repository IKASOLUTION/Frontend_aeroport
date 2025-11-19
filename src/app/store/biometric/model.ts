import { Enregistrement } from "../enregistrement/model";

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
}


export interface DonneeBiometriqueList {
  profils: DonneeBiometrique[];
  selectedDonneeBiometrique: DonneeBiometrique | null;
  loading: boolean;
  error: string | null;
}
