import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Interface pour le statut de l'appareil
 */
export interface DeviceStatus {
  connected: boolean;
  deviceName?: string;
  deviceId?: string;
  error?: string;
  documentPresent?: boolean;
  ready?: boolean;
}

/**
 * Interface pour les données d'identité extraites
 */
export interface IdentityData {
  documentType?: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  nationalNumber?: string;
  address?: string;
  photo?: string;
  mrz?: string;
  sex?: string;
}

/**
 * Configuration du SDK Regula
 */
export interface RegulaConfig {
  deviceId?: string;
  exclusive?: boolean;
  apiUrl?: string;
  licenseKey?: string;
  timeout?: number;
}

/**
 * Type d'image à capturer
 */
export type ImageType = 'white' | 'ir' | 'uv' | 'axial';

/**
 * Service Angular pour gérer le lecteur de documents Regula
 * Compatible avec les modèles Regula 70X4M, 7310, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class RegulaDocumentReaderService {
  
  // URL de l'API locale du Document Reader SDK
  private readonly API_BASE_URL = 'http://127.0.0.1:9443/api/v1';
  
  // Sujets RxJS pour l'état réactif
  private deviceStatusSubject = new BehaviorSubject<DeviceStatus>({
    connected: false,
    ready: false
  });
  
  private identityDataSubject = new BehaviorSubject<IdentityData | null>(null);
  
  // Configuration du service
  private config: RegulaConfig = {
    exclusive: true,
    timeout: 30000 // 30 secondes
  };
  
  // État interne
  private initialized = false;
  private documentDetectionInterval?: any;
  
  constructor() {
    console.log('RegulaDocumentReaderService initialisé');
  }

  /**
   * Initialise le lecteur Regula
   */
  async initialize(config?: Partial<RegulaConfig>): Promise<void> {
    if (this.initialized) {
      console.warn('Service Regula déjà initialisé');
      return;
    }

    try {
      // Fusionner la configuration
      if (config) {
        this.config = { ...this.config, ...config };
      }

      console.log('Initialisation du lecteur Regula...', this.config);

      // Vérifier si le SDK est accessible
      const sdkAvailable = await this.checkSDKAvailability();
      
      if (!sdkAvailable) {
        throw new Error(
          'Le SDK Regula Document Reader n\'est pas accessible. ' +
          'Veuillez vérifier que le service est démarré sur le port 9443.'
        );
      }

      // Obtenir la liste des périphériques
      const devices = await this.listDevices();
      
      if (devices.length === 0) {
        throw new Error('Aucun lecteur Regula détecté. Vérifiez la connexion USB.');
      }

      // Sélectionner le périphérique
      const deviceId = this.config.deviceId || devices[0].id;
      const device = devices.find(d => d.id === deviceId) || devices[0];

      // Initialiser le périphérique en mode exclusif
      await this.initializeDevice(device.id);

      // Mettre à jour le statut
      this.deviceStatusSubject.next({
        connected: true,
        ready: true,
        deviceName: device.name,
        deviceId: device.id
      });

      this.initialized = true;
      console.log('✅ Lecteur Regula initialisé avec succès:', device.name);

    } catch (error) {
      const errorMessage = (error as Error).message || 'Erreur inconnue';
      console.error('❌ Erreur initialisation Regula:', error);
      
      this.deviceStatusSubject.next({
        connected: false,
        ready: false,
        error: errorMessage
      });
      
      throw error;
    }
  }

  /**
   * Vérifie si le SDK est accessible
   */
  private async checkSDKAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      console.error('SDK non accessible:', error);
      return false;
    }
  }

  /**
   * Liste tous les lecteurs Regula connectés
   */
  private async listDevices(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/devices`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Impossible de lister les périphériques');
      }

      const data = await response.json();
      return data.devices || [];
      
    } catch (error) {
      console.error('Erreur listage périphériques:', error);
      return [];
    }
  }

  /**
   * Initialise un périphérique spécifique en mode exclusif
   */
  private async initializeDevice(deviceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/device/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: deviceId,
          exclusive: this.config.exclusive
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur initialisation périphérique');
      }

      console.log(`Périphérique ${deviceId} initialisé en mode exclusif`);
      
    } catch (error) {
      console.error('Erreur initializeDevice:', error);
      throw error;
    }
  }

  /**
   * Lit un document et extrait les données
   */
  readDocument(): Observable<IdentityData> {
    if (!this.initialized) {
      return throwError(() => new Error('Service non initialisé. Appelez initialize() d\'abord.'));
    }

    return from(this.performDocumentRead()).pipe(
      map(data => {
        this.identityDataSubject.next(data);
        return data;
      }),
      catchError(error => {
        console.error('Erreur lecture document:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Effectue la lecture du document
   */
  private async performDocumentRead(): Promise<IdentityData> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processParam: {
            scenario: 'FullProcess',
            resultTypeOutput: ['TEXT', 'IMAGES', 'MRZ']
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la lecture du document');
      }

      const result = await response.json();
      return this.extractIdentityData(result);
      
    } catch (error) {
      console.error('Erreur performDocumentRead:', error);
      throw error;
    }
  }

  /**
   * Extrait les données d'identité du résultat brut
   */
  private extractIdentityData(result: any): IdentityData {
    const textFields = result.text?.fieldList || [];
    const images = result.images?.fieldList || [];

    // Fonction helper pour récupérer un champ
    const getField = (fieldType: number): string | undefined => {
      const field = textFields.find((f: any) => f.fieldType === fieldType);
      return field?.value || undefined;
    };

    // Extraire la photo
    const photoField = images.find((img: any) => 
      img.fieldType === 3 || img.lightType === 1
    );

    return {
      documentType: getField(0),
      documentNumber: getField(1),
      firstName: getField(2),
      lastName: getField(3),
      dateOfBirth: getField(4),
      placeOfBirth: getField(5),
      nationality: getField(6),
      issueDate: getField(7),
      expiryDate: getField(8),
      issuingAuthority: getField(9),
      nationalNumber: getField(10),
      address: getField(11),
      sex: getField(12),
      photo: photoField?.value || undefined,
      mrz: result.text?.mrz || undefined
    };
  }

  /**
   * Capture une image du document
   */
  async captureImage(type: ImageType = 'white'): Promise<string> {
    if (!this.initialized) {
      throw new Error('Service non initialisé');
    }

    try {
      const lightMap: Record<ImageType, number> = {
        white: 6,    // Lumière blanche
        ir: 1,       // Infrarouge
        uv: 4,       // Ultraviolet
        axial: 16    // Axiale
      };

      const response = await fetch(`${this.API_BASE_URL}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          light: lightMap[type]
        })
      });

      if (!response.ok) {
        throw new Error('Erreur capture image');
      }

      const result = await response.json();
      return result.image || '';
      
    } catch (error) {
      console.error('Erreur captureImage:', error);
      throw error;
    }
  }

  /**
   * Vérifie la présence d'un document
   */
  async checkDocumentPresence(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/document/present`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return false;

      const result = await response.json();
      const isPresent = result.present === true;

      // Mettre à jour le statut
      const currentStatus = this.deviceStatusSubject.value;
      this.deviceStatusSubject.next({
        ...currentStatus,
        documentPresent: isPresent
      });

      return isPresent;
      
    } catch (error) {
      console.error('Erreur vérification document:', error);
      return false;
    }
  }

  /**
   * Démarre la détection automatique de document
   */
  startDocumentDetection(intervalMs: number = 1000): void {
    if (this.documentDetectionInterval) {
      return;
    }

    console.log('Détection automatique activée');
    
    this.documentDetectionInterval = setInterval(async () => {
      await this.checkDocumentPresence();
    }, intervalMs);
  }

  /**
   * Arrête la détection automatique
   */
  stopDocumentDetection(): void {
    if (this.documentDetectionInterval) {
      clearInterval(this.documentDetectionInterval);
      this.documentDetectionInterval = undefined;
      console.log('Détection automatique désactivée');
    }
  }

  /**
   * Rafraîchit le statut du périphérique
   */
  async refreshStatus(): Promise<DeviceStatus> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/device/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer le statut');
      }

      const status = await response.json();
      
      const deviceStatus: DeviceStatus = {
        connected: status.connected || false,
        ready: status.ready || false,
        deviceName: status.deviceName,
        deviceId: status.deviceId
      };

      this.deviceStatusSubject.next(deviceStatus);
      return deviceStatus;
      
    } catch (error) {
      const errorStatus: DeviceStatus = {
        connected: false,
        ready: false,
        error: (error as Error).message
      };
      
      this.deviceStatusSubject.next(errorStatus);
      return errorStatus;
    }
  }

  /**
   * Efface les données en mémoire
   */
  clearData(): void {
    this.identityDataSubject.next(null);
    console.log('Données effacées');
  }

  /**
   * Libère les ressources
   */
  async dispose(): Promise<void> {
    try {
      this.stopDocumentDetection();
      
      if (this.initialized) {
        await fetch(`${this.API_BASE_URL}/device/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      this.initialized = false;
      this.deviceStatusSubject.next({ connected: false, ready: false });
      
      console.log('Service Regula libéré');
      
    } catch (error) {
      console.error('Erreur libération:', error);
    }
  }

  /**
   * Observable du statut du périphérique
   */
  getDeviceStatus(): Observable<DeviceStatus> {
    return this.deviceStatusSubject.asObservable();
  }

  /**
   * Observable des données d'identité
   */
  getIdentityData(): Observable<IdentityData | null> {
    return this.identityDataSubject.asObservable();
  }

  /**
   * Obtient le statut actuel (synchrone)
   */
  getCurrentStatus(): DeviceStatus {
    return this.deviceStatusSubject.value;
  }

  /**
   * Obtient les données d'identité actuelles (synchrone)
   */
  getCurrentIdentityData(): IdentityData | null {
    return this.identityDataSubject.value;
  }

  /**
   * Vérifie si le service est initialisé
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}