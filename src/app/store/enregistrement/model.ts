export interface Enregistrement {
  id?: number;
   // Document
  typeDocument?: TypeDocument;
  numeroDocument?: string;
  numeroNip?: string | null;
  dateDelivrance?: string;
  lieuDelivrance?: string;
  photoProfil?: File | null;
  imageRecto?: File | null;
  imageVerso?: File | null;

  // Personal Info
  nomFamille?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  profession?: string;
  
  // Coordonnees
  paysResidence?: string;
  emailContact?: string | null;
  telephoneBurkina?: string | null;
  telephoneEtranger?: string | null;
  adresseBurkina?: string | null;
  adresseEtranger?: string | null;
  
  // Voyage
  volId?: number | null;
  villeDepart?: string;
  villeDestination?: string;
  dateVoyage?: string;
  heureVoyage?: string;
  motifVoyage?: MotifVoyage;
  etatVoyage?: 'ALLER' | 'RETOUR' | 'ALLER_RETOUR';
  dureeSejour?: number | null;
  nbreVoyage?: number | 0;
  statut?: string;
  informationPersonnelle?: InformationPersonnelle;
  informationPersonnelleId?: number;
  aeroportDepart?: string;
  aeroportDestination?: string;
}



export interface EnregistrementList {
  enregistrements?: Enregistrement[];
  selectedEnregistrement?: Enregistrement | null;
  loading?: boolean;
  error?: string | null;
}

export  enum MotifVoyage {
    AFFAIRES,
    TOURISME,
    FAMILLE,
    ETUDES,
    MEDICAL
}


export enum TypeDocument {
    
    PASSEPORT, CNI, PERMIS_CONDUIRE
    
}

export enum TypeCapture {

    ENROLEMENT, CONTROLE
    
}

export enum StatutDonneeBio {
    VALIDE, INVALIDE, EXPIREE
}

export class InformationPersonnelle  {
  id?: number;
  nomFamille?: string;
  prenom?: string;
  dateNaissance?: Date ;
  lieuNaissance?: string;
  nationalite?: string;
  typeDocument?: TypeDocument;
  numeroDocument?: string;
  dateDelivrance?: Date;
  lieuDelivrance?: string;
  numeroNip?: string;
  profession?: string;
  adresseBurkina?: string;
  telephoneBurkina?: string;
  paysResidence?: string;
  emailContact?: string;
}


export interface EmpreinteCapture {
  image: string | null;
  capturee: boolean;
}