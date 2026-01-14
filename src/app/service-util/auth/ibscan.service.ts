import { Injectable } from '@angular/core';
import { Observable, Subject, from, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

export interface IBScanDevice {
  index: number;
  name: string;
  isActive: boolean;
  serialNumber?: string;
}

export interface IBScanImage {
  data: string; // Base64 image data
  width: number;
  height: number;
  resolution: number;
  fingerPosition: string;
  quality?: string;
  timestamp?: string;
}

export interface IBScanStatus {
  sdkVersion: string;
  devices: IBScanDevice[];
  isInitialized: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IBScanService {
  private readonly API_BASE_URL = '/ibsu-api';
  private deviceIndex = 0;
  private captureSubject = new Subject<IBScanImage>();
  
  // Observable pour écouter les captures en temps réel
  public onCapture$ = this.captureSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Vérifie la disponibilité du SDK et récupère la version
   */
  checkSDKVersion(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/version`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Initialise le SDK IBScan
   */
  initializeSDK(): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/initialize`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère la liste des scanners connectés
   */
  getDevices(): Observable<IBScanDevice[]> {
    return this.http.get<IBScanDevice[]>(`${this.API_BASE_URL}/devices`).pipe(
      map(devices => devices || []),
      catchError(this.handleError)
    );
  }

  /**
   * Ouvre un scanner spécifique
   */
  openDevice(deviceIndex: number): Observable<any> {
    this.deviceIndex = deviceIndex;
    return this.http.post(`${this.API_BASE_URL}/device/open`, { 
      deviceIndex 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Ferme le scanner actif
   */
  closeDevice(): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/device/close`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Démarre la capture d'empreintes
   */
  startCapture(fingerPosition: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/capture/start`, {
      fingerPosition,
      captureMode: 'AUTO'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Arrête la capture en cours
   */
  stopCapture(): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/capture/stop`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère l'image capturée
   */
  getCapturedImage(): Observable<IBScanImage> {
    return this.http.get<IBScanImage>(`${this.API_BASE_URL}/capture/image`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Capture une empreinte avec gestion complète du flux
   */
  async captureFingerprint(fingerPosition: string): Promise<string> {
    try {
      // 1. Démarrer la capture
      await this.startCapture(fingerPosition).toPromise();
      
      // 2. Attendre que l'image soit disponible
      await this.waitForCapture();
      
      // 3. Récupérer l'image
      const image = await this.getCapturedImage().toPromise();
      
      // 4. Vérifier que l'image existe et a des données
      if (!image) {
        throw new Error('Aucune image retournée par le scanner');
      }
      
      if (!image.data) {
        throw new Error('Image capturée mais données manquantes');
      }
      
      // 5. Arrêter la capture
      await this.stopCapture().toPromise();
      
      // 6. S'assurer que l'image a le bon format
      const imageBase64 = image.data.includes('base64,') 
        ? image.data 
        : `data:image/png;base64,${image.data}`;
      
      return imageBase64;
      
    } catch (error) {
      console.error('Erreur capture empreinte:', error);
      
      // Essayer d'arrêter la capture en cas d'erreur
      try {
        await this.stopCapture().toPromise();
      } catch (stopError) {
        console.error('Erreur lors de l\'arrêt de la capture:', stopError);
      }
      
      throw error;
    }
  }

  /**
   * Attend que la capture soit terminée (polling)
   */
  private waitForCapture(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 secondes max
      
      const checkStatus = setInterval(async () => {
        attempts++;
        
        try {
          const status = await this.http.get<any>(
            `${this.API_BASE_URL}/capture/status`
          ).toPromise();
          
          if (status && status.isComplete) {
            clearInterval(checkStatus);
            resolve();
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            reject(new Error('Timeout: capture non terminée après 30 secondes'));
          }
        } catch (error) {
          clearInterval(checkStatus);
          reject(error);
        }
      }, 1000);
    });
  }

  /**
   * Configure les paramètres du scanner
   */
  configureDevice(settings: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/device/configure`, settings).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère le statut global du système
   */
  getStatus(): Observable<IBScanStatus> {
    return this.http.get<IBScanStatus>(`${this.API_BASE_URL}/status`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Convertit une image base64 en File pour l'upload
   * Version sécurisée avec gestion d'erreurs
   */
  base64ToFile(base64: string, filename: string): File {
    try {
      // Vérifier que base64 n'est pas vide
      if (!base64 || typeof base64 !== 'string') {
        throw new Error('Base64 string invalide');
      }

      // Gérer les deux formats possibles
      let base64Data: string;
      let mimeType = 'image/png'; // Type par défaut

      if (base64.includes(',')) {
        // Format: data:image/png;base64,xxxxx
        const arr = base64.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
        }
        
        base64Data = arr[1] || arr[0];
      } else {
        // Format: xxxxx (sans préfixe)
        base64Data = base64;
      }

      // Décoder le base64
      const bstr = atob(base64Data);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mimeType });
      
    } catch (error) {
      console.error('Erreur conversion base64 vers File:', error);
      
      // En cas d'erreur, retourner un fichier vide
      return new File([], filename, { type: 'image/png' });
    }
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur IBScan. Vérifiez que l\'API est démarrée sur le port 5020.';
      } else if (error.status === 404) {
        errorMessage = 'Endpoint API non trouvé. Vérifiez l\'URL de l\'API.';
      } else if (error.status === 500) {
        errorMessage = `Erreur serveur: ${error.message}`;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('Erreur IBScan Service:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Vérifie si le service est accessible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.checkSDKVersion().toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test de connectivité complet
   */
  async testConnection(): Promise<{
    apiAvailable: boolean;
    sdkInitialized: boolean;
    devicesFound: number;
    error?: string;
  }> {
    const result = {
      apiAvailable: false,
      sdkInitialized: false,
      devicesFound: 0,
      error: undefined as string | undefined
    };

    try {
      // Test 1: API disponible
      await this.checkSDKVersion().toPromise();
      result.apiAvailable = true;

      // Test 2: SDK initialisé
      const status = await this.getStatus().toPromise();
      if (status) {
        result.sdkInitialized = status.isInitialized;
        result.devicesFound = status.devices?.length || 0;
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    return result;
  }
}