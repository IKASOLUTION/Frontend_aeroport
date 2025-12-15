import { RegulaDocumentReaderService } from "../auth/regularForensic.service";

export function initializeRegulaService(regulaService: RegulaDocumentReaderService) {
  return () => {
    return regulaService.initialize({
      exclusive: true,
      timeout: 30000
    }).catch(error => {
      console.warn('⚠️ Lecteur Regula non disponible au démarrage:', error.message);
      // L'application peut continuer sans le lecteur
      return Promise.resolve();
    });
  };
}