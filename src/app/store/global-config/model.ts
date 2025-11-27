export enum StatusEnum {
    error = 'error',
    success = 'success',
    warning = 'warn'
  }

export interface Status {
    status: StatusEnum;
    message: string;
    reset?: boolean;
    params?: any;
  }

export enum StatutAeroport {
    ACTIF = 'ACTIF',
    INACTIF = 'INACTIF',
    MAINTENANCE = 'MAINTENANCE'
}

export enum Statut {

      ACTIF= 'ACTIF',
      INACTIF= 'INACTIF',
      SUSPENDU= 'SUSPENDU',
       LEVEE= 'LEVEE'
}

export enum TypeAeroport {

    INTERNATIONAL= 'INTERNATIONAL',
    NATIONAL = 'NATIONAL',
    
}


export enum StatutVoyage {
  ACTIF= 'ACTIF',
  INACTIF= 'INACTIF',
  ANNULE= 'INACTIF'
}
  
  