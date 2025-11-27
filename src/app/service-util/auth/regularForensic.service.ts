import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError, interval } from 'rxjs';
import { map, catchError, switchMap, filter } from 'rxjs/operators';

export interface IdentityData {
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  sex?: string;
  nationalNumber?: string;
  placeOfBirth?: string;
  expiryDate?: string;
  issueDate?: string;
  documentType?: string;
  issuingCountry?: string;
  address?: string;
  photo?: string;
  mrzLine1?: string;
  mrzLine2?: string;
  mrzLine3?: string;
  rawData?: any;
}

export interface DeviceStatus {
  connected: boolean;
  deviceName?: string;
  documentPresent?: boolean;
  error?: string;
}

export interface RegulaResponse {
  Status: number;
  Msg?: string;
  Text?: any;
  Images?: any;
  Graphics?: any;
  DocumentType?: any;
  ChipPage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegulaDocumentReaderService {
  private deviceStatus$ = new BehaviorSubject<DeviceStatus>({ 
    connected: false,
    documentPresent: false 
  });
  private identityData$ = new BehaviorSubject<IdentityData | null>(null);
  
  // URL du service Regula (peut être local ou sur un serveur)
  private readonly REGULA_API_URL = 'http://localhost:3480/api'; // Port par défaut du SDK
  
  // Polling pour vérifier la présence du document
  private documentCheckInterval: any;

  constructor() {
    this.checkDeviceConnection();
  }

  /**
   * Vérifie si le service Regula est disponible
   */
  private async checkDeviceConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.REGULA_API_URL}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.deviceStatus$.next({
          connected: true,
          deviceName: 'Regula 70X4M'
        });
      }
    } catch (error) {
      this.deviceStatus$.next({
        connected: false,
        error: 'Service Regula Document Reader non disponible. Vérifiez que le SDK est installé et démarré.'
      });
    }
  }

  /**
   * Démarre la détection automatique de document
   */
  startDocumentDetection(): void {
    if (this.documentCheckInterval) {
      return;
    }

    this.documentCheckInterval = setInterval(async () => {
      try {
        const hasDocument = await this.checkDocumentPresence();
        this.deviceStatus$.next({
          ...this.deviceStatus$.value,
          documentPresent: hasDocument
        });
      } catch (error) {
        console.error('Erreur détection document:', error);
      }
    }, 1000); // Vérifie toutes les secondes
  }

  /**
   * Arrête la détection automatique
   */
  stopDocumentDetection(): void {
    if (this.documentCheckInterval) {
      clearInterval(this.documentCheckInterval);
      this.documentCheckInterval = null;
    }
  }

  /**
   * Vérifie la présence d'un document
   */
  async checkDocumentPresence(): Promise<boolean> {
    try {
      const response = await fetch(`${this.REGULA_API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          processParam: {
            scenario: 'MrzAndLocate'
          }
        })
      });

      const data: RegulaResponse = await response.json();
      return data.Status === 1; // 1 = succès avec document
    } catch (error) {
      return false;
    }
  }

  /**
   * Lit le document inséré dans le lecteur
   */
  readDocument(): Observable<IdentityData> {
    return from(this.performDocumentRead()).pipe(
      map(data => {
        this.identityData$.next(data);
        return data;
      }),
      catchError(error => {
        console.error('Erreur lecture document:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Effectue la lecture complète du document
   */
  private async performDocumentRead(): Promise<IdentityData> {
    try {
      // Configuration de la requête de traitement
      const processRequest = {
        processParam: {
          scenario: 'FullProcess', // Traitement complet
          multipageProcessing: false,
          imageQA: {
            expectedPass: ["dpiThreshold", "glaresCheck"]
          },
          returnImages: true,
          returnCroppedBarcode: false
        }
      };

      const response = await fetch(`${this.REGULA_API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processRequest)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le lecteur');
      }

      const result: RegulaResponse = await response.json();

      if (result.Status === 0) {
        throw new Error('Aucun document détecté ou erreur de lecture');
      }

      if (result.Status === 2) {
        throw new Error(result.Msg || 'Erreur lors du traitement du document');
      }

      return this.parseRegulaResponse(result);

    } catch (error: any) {
      throw new Error(error.message || 'Impossible de lire le document');
    }
  }

  /**
   * Parse la réponse du SDK Regula
   */
  private parseRegulaResponse(response: RegulaResponse): IdentityData {
    const textFields = response.Text?.fieldList || [];
    const images = response.Images?.fieldList || [];
    
    const identity: IdentityData = {
      rawData: response
    };

    // Extraction des champs texte
    textFields.forEach((field: any) => {
      const fieldType = field.fieldType;
      const value = field.value || field.values?.[0]?.value;

      if (!value) return;

      switch (fieldType) {
        case 0: // Document Number
          identity.documentNumber = value;
          break;
        case 1: // Surname
          identity.lastName = value;
          break;
        case 2: // Given Names
          identity.firstName = value;
          break;
        case 5: // Date of Birth
          identity.dateOfBirth = this.formatDate(value);
          break;
        case 7: // Nationality
          identity.nationality = value;
          break;
        case 8: // Sex
          identity.sex = value;
          break;
        case 9: // Place of Birth
          identity.placeOfBirth = value;
          break;
        case 10: // Date of Issue
          identity.issueDate = this.formatDate(value);
          break;
        case 11: // Date of Expiry
          identity.expiryDate = this.formatDate(value);
          break;
        case 13: // Issuing State
          identity.issuingCountry = value;
          break;
        case 21: // National Number / Personal Number
          identity.nationalNumber = value;
          break;
        case 50: // Address
          identity.address = value;
          break;
        case 220: // MRZ Line 1
          identity.mrzLine1 = value;
          break;
        case 221: // MRZ Line 2
          identity.mrzLine2 = value;
          break;
        case 222: // MRZ Line 3
          identity.mrzLine3 = value;
          break;
      }
    });

    // Extraction de la photo
    const portraitField = images.find((img: any) => 
      img.fieldType === 201 // Portrait
    );

    if (portraitField?.value) {
      identity.photo = `data:image/jpeg;base64,${portraitField.value}`;
    }

    // Déduction du type de document
    if (response.DocumentType) {
      const docType = response.DocumentType[0];
      identity.documentType = this.getDocumentTypeName(docType?.dType);
    }

    return identity;
  }

  /**
   * Convertit le code de type de document Regula en nom lisible
   */
  private getDocumentTypeName(dType: number): string {
    const types: { [key: number]: string } = {
      1: 'Passeport',
      2: "Carte d'identité",
      3: 'Visa',
      4: 'Permis de conduire',
      11: 'Carte de résidence'
    };
    return types[dType] || 'Document';
  }

  /**
   * Formate une date du format Regula (YYMMDD ou YYYYMMDD) vers ISO
   */
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';

    // Nettoie la chaîne
    const cleaned = dateStr.replace(/[^0-9]/g, '');

    if (cleaned.length === 6) {
      // Format YYMMDD
      const year = parseInt(cleaned.substring(0, 2));
      const month = cleaned.substring(2, 4);
      const day = cleaned.substring(4, 6);
      
      // Détermine le siècle (années > 50 = 19xx, sinon 20xx)
      const fullYear = year > 50 ? `19${year}` : `20${year}`;
      
      return `${fullYear}-${month}-${day}`;
    } else if (cleaned.length === 8) {
      // Format YYYYMMDD
      const year = cleaned.substring(0, 4);
      const month = cleaned.substring(4, 6);
      const day = cleaned.substring(6, 8);
      
      return `${year}-${month}-${day}`;
    }

    return dateStr;
  }

  /**
   * Capture une image du document
   */
  async captureImage(lightType: 'white' | 'ir' | 'uv' = 'white'): Promise<string> {
    try {
      const response = await fetch(`${this.REGULA_API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          processParam: {
            scenario: 'CaptureImage',
            lightType: lightType
          }
        })
      });

      const result = await response.json();
      
      if (result.Images?.fieldList?.[0]?.value) {
        return `data:image/jpeg;base64,${result.Images.fieldList[0].value}`;
      }

      throw new Error('Impossible de capturer l\'image');
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de capture');
    }
  }

  /**
   * Obtient le statut de l'appareil
   */
  getDeviceStatus(): Observable<DeviceStatus> {
    return this.deviceStatus$.asObservable();
  }

  /**
   * Obtient les données d'identité
   */
  getIdentityData(): Observable<IdentityData | null> {
    return this.identityData$.asObservable();
  }

  /**
   * Efface les données en mémoire
   */
  clearData(): void {
    this.identityData$.next(null);
  }

  /**
   * Rafraîchit le statut de connexion
   */
  async refreshStatus(): Promise<DeviceStatus> {
    await this.checkDeviceConnection();
    return this.deviceStatus$.value;
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    this.stopDocumentDetection();
  }
}