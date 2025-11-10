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
     static readonly DIRECTION = {
        prod: `${SERVICE_PREFIX}/directions`,
        mock: `assets/mock/direction.mock.json`
    };
    static readonly DASHBOARD_TASKS = {
    prod: `${SERVICE_PREFIX}/dashboard/tasks`,
    mock: `assets/mock/dashboard-tasks.mock.json`
  };

  static readonly AGENTS_BY_SERVICE = {
    prod: `${SERVICE_PREFIX}/dashboard/agents`,
    mock: `assets/mock/dashboard-agents.mock.json`
  };

     static readonly SERVICE = {
        prod: `${SERVICE_PREFIX}/services`,
        mock: `assets/mock/service.mock.json`
    };

    static readonly AGENT = {
        prod: `${SERVICE_PREFIX}/agents`,
        mock: `assets/mock/agent.mock.json`
    };
    static readonly AFFECTATION = {
        prod: `${SERVICE_PREFIX}/affectations`,
        mock: `assets/mock/affectation.mock.json`
    };

    static readonly TACHE = {
        prod: `${SERVICE_PREFIX}/taches`,
        mock: `assets/mock/tache.mock.json`
    };
    static readonly NOTIFICATION = {
        prod: `${SERVICE_PREFIX}/notifications`,
        mock: `assets/mock/notifications.mock.json`
    };
    static readonly MOTIF = {
        prod: `${SERVICE_PREFIX}/motifs`,
        mock: `assets/mock/motif.mock.json`
    };
    static readonly COURRIER = {
        prod: `${SERVICE_PREFIX}/courriers`,
        mock: `assets/mock/courriers.mock.json`
    };
    static readonly AGENTCESSATION = {
        prod: `${SERVICE_PREFIX}/agentcessations`,
        mock: `assets/mock/agentcessation.mock.json`
    };

        static readonly INSTRUCTION = {
        prod: `${SERVICE_PREFIX}/instructions`,
        mock: `assets/mock/instruction.mock.json`
    };


    static readonly DASHBOARD_HISTOGRAMME = {
        prod: `${SERVICE_PREFIX}/taches/statistiques/histogramme`,
        mock: `assets/mock/instruction.mock.json`
    };



    static readonly DASHBOARD_CAMEMBERT = {
        prod: `${SERVICE_PREFIX}/taches/statistiques/camembert`,
        mock: `assets/mock/instruction.mock.json`
    };




     static readonly AGENTBYSERVICE = {
        prod: `${SERVICE_PREFIX}/agents/find-by-service-user-connected`,
        mock: `assets/mock/agent.mock.json`
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




}
