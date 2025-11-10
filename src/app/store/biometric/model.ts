import { Enregistrement } from "../enregistrement/model";

export interface DonneeBiometrique {
  id?: number;
  empreinteDroite?: boolean;
  empreinteGauche?: boolean;
  empreintePouces?: boolean;
  enregistrementId?: number;
  photoBiometrique?: File | null;
}


export interface DonneeBiometriqueList {
  profils: DonneeBiometrique[];
  selectedDonneeBiometrique: DonneeBiometrique | null;
  loading: boolean;
  error: string | null;
}
