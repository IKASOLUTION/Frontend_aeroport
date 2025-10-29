export const SERVICE_PREFIX = `/api`;

export class Endpoints {
    static readonly PROFIL = {
        prod: `${SERVICE_PREFIX}/profils`,
        mock: `assets/mock/profil.mock.json`
    };

    static readonly USER = {
        prod: `${SERVICE_PREFIX}/users`,
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

}
