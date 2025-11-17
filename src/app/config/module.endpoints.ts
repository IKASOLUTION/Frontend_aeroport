export const SERVICE_PREFIX = `api`;

export class Endpoints {
    static readonly PROFIL = {
        prod: `${SERVICE_PREFIX}/profils`,
        mock: `assets/mock/profil.mock.json`
    };

    static readonly USER = {
        prod: `${SERVICE_PREFIX}/users/`,
        mock: `assets/mock/user.mock.json`
    };

    static readonly MODULE = {
        prod: `${SERVICE_PREFIX}/moduleParams`,
        mock: `assets/mock/moduleParam.mock.json`
    };
    static readonly MENU = {
        prod: `${SERVICE_PREFIX}/menuActions`,
        mock: `assets/mock/menuAction.mock.json`
    };
    static readonly ENREIGISTREMENT = {
        prod: `${SERVICE_PREFIX}/enregistrements`,
        mock: `assets/mock/enregistrements.mock.json`
    };

     static readonly BIOMETRIC = {
        prod: `${SERVICE_PREFIX}/donneeBiometriques`,
        mock: `assets/mock/donneeBiometrique.mock.json`
    };

     static readonly PAYS = {
        prod: `${SERVICE_PREFIX}/pays`,
        mock: `assets/mock/pays.mock.json`
    };

      static readonly VILLE = {
        prod: `${SERVICE_PREFIX}/ville`,
        mock: `assets/mock/ville.mock.json`
    };

      static readonly AEROPORT = {
        prod: `${SERVICE_PREFIX}/aeroports`,
        mock: `assets/mock/aeroport.mock.json`
    };


    
      static readonly COMPAGNIE = {
        prod: `${SERVICE_PREFIX}/compagnies`,
        mock: `assets/mock/aeroport.mock.json`
    };


    static readonly VOL = {
        prod: `${SERVICE_PREFIX}/vols`,
        mock: `assets/mock/vol.mock.json`
    };
     static readonly ListeNoire = {
        prod: `${SERVICE_PREFIX}/liste-noires`,
        mock: `assets/mock/listeNoire.mock.json`
    };


      static readonly MotifVoyage = {
        prod: `${SERVICE_PREFIX}/motif-voyages`,
        mock: `assets/mock/motifVoyage.mock.json`
    };


    




}
