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
  image?: string;
  FaceImage?: string;
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
  private readonly API_BASE_URL = '/Regula.SDK.Api';
  
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
      const sdkAvailable = await this.findStatusAppareil();
      
      if (!sdkAvailable) {
        throw new Error(
          'Le SDK Regula Document Reader n\'est pas accessible. ' +
          'Veuillez vérifier que le service est démarré sur le port 80.'
        );
      }

      // Mettre à jour le statut
      this.deviceStatusSubject.next({
        connected: true,
        ready: true,
        deviceName: "regula",
        deviceId: "device.id"
      });

      this.initialized = true;
    //  console.log('✅ Lecteur Regula initialisé avec succès:', device.name);

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

  

  private async findStatusAppareil(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/Methods/Connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      console.error('SDK non accessible:', error);
      return false;
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
      

       const response = await fetch(`${this.API_BASE_URL}/Hospitality/Scan`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la lecture du document');
      }

      console.log('reponse brut de la lecture du document:', response);
      const result = await response.json();
      console.log('Résultat brut de la lecture du document:', result);
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
  console.log('Extraction des données depuis:', result);

  return {
    documentType: result.IDType || undefined,
    documentNumber: result.IDNumber || undefined,
    firstName: result.FirstName || result.AltFirstName || undefined,
    lastName: result.LastName || result.AltLastName || undefined,
    dateOfBirth: result.BirthDate || undefined,
    placeOfBirth: result.PlaceOfBirth || undefined,
    nationality: result.NationalityLong || result.Nationality || undefined,
    issueDate: result.IssueDate || undefined,
    expiryDate: result.ExpirationDate || undefined,
    issuingAuthority: result.PlaceOfIssue || undefined,
    nationalNumber: result.IDNumber || undefined,
    address: this.buildAddress(result),
    sex: result.Gender || undefined,
    photo: result.FaceImage || undefined,
    image: result.Image || undefined,
    mrz: result.mrz || undefined // Pas présent dans le résultat
  };
}

// Fonction helper pour construire l'adresse complète
private buildAddress(result: any): string | undefined {
  const addressParts = [
    result.Address1,
    result.City,
    result.PostalCode,
    result.Province,
    result.State,
    result.County,
    result.CountryLong || result.Country
  ].filter(part => part !== null && part !== undefined && part !== '');

  return addressParts.length > 0 ? addressParts.join(', ') : undefined;
}

  getCurrentStatus(): DeviceStatus {
    return this.deviceStatusSubject.value;
  }

  
}