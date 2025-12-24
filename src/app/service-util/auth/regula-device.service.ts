import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, map, switchMap, startWith } from 'rxjs/operators';
import { Endpoints } from "src/app/config/module.endpoints";

export interface RegulaDeviceStatusDto {
  connected: boolean;
  deviceType?: string;
  apiUrl?: string;
  errorMessage?: string;
  firmwareVersion?: string;
  ready: boolean;
}

export interface DocumentData {
  lastName?: string;
  firstName?: string;
  dateOfBirth?: string;
  documentNumber?: string;
  nationality?: string;
  expiryDate?: string;
  issueDate?: string;
  dateIssue?: string;
  lieuNaissance?: string;
  lieuDelivrance?: string;
  sexe?: string;
  profession?: string;
  nip?: string;
}

export interface CaptureResponse {
  success: boolean;
  image?: string;
  side?: string;
  size?: number;
  data?: DocumentData;
  error?: string;
}

export interface PingResponse {
  connected: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegulaDeviceService {
  
  // Observable pour suivre le statut de l'appareil
  private deviceStatusSubject = new BehaviorSubject<RegulaDeviceStatusDto>({
    connected: false,
    ready: false
  });
  
  public deviceStatus$ = this.deviceStatusSubject.asObservable();
  
  // État de capture en cours
  private capturingSubject = new BehaviorSubject<boolean>(false);
  public capturing$ = this.capturingSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier le statut de l'appareil toutes les 10 secondes
    this.startDeviceMonitoring();
  }

  /**
   * Démarre la surveillance du statut de l'appareil
   */
  private startDeviceMonitoring(): void {
    interval(10000) // Toutes les 10 secondes
      .pipe(
        startWith(0), // Vérifier immédiatement au démarrage
        switchMap(() => this.checkDeviceStatus())
      )
      .subscribe({
        next: (status) => {
          this.deviceStatusSubject.next(status);
          
          // Log uniquement si le statut change
          const currentStatus = this.deviceStatusSubject.value;
          if (currentStatus.connected !== status.connected) {
            console.log('📱 Statut appareil mis à jour:', status.connected ? 'Connecté' : 'Déconnecté');
          }
        },
        error: (err) => console.error('❌ Erreur monitoring appareil:', err)
      });
  }

  /**
   * Vérifie si l'appareil Regula est connecté
   * GET /api/regula/device/status
   */
  checkDeviceStatus(): Observable<RegulaDeviceStatusDto> {
    return this.http.get<RegulaDeviceStatusDto>(Endpoints.RegulaDeviceEndpoints.status).pipe(
      map(status => {
        console.log('✓ Statut reçu:', status);
        return status;
      }),
      catchError(err => {
        console.error('❌ Erreur statut appareil:', err.message || err);
        const errorStatus: RegulaDeviceStatusDto = {
          connected: false,
          ready: false,
          errorMessage: 'Impossible de contacter le service Regula'
        };
        return of(errorStatus);
      })
    );
  }

  /**
   * Ping rapide pour vérifier la connexion
   * GET /api/regula/device/ping
   */
  ping(): Observable<boolean> {
    return this.http.get<PingResponse>(Endpoints.RegulaDeviceEndpoints.ping).pipe(
      map(response => {
        console.log('📡 Ping réussi:', response.connected);
        return response.connected;
      }),
      catchError(err => {
        console.error('❌ Ping échoué:', err.message || err);
        return of(false);
      })
    );
  }

  /**
   * Capture uniquement un document depuis l'appareil physique (sans traitement OCR)
   * POST /api/regula/device/capture/document?side=xxx
   * @param side 'recto' ou 'verso'
   */
  captureDocument(side: 'recto' | 'verso'): Observable<CaptureResponse> {
    console.log(`🔍 Démarrage capture ${side}...`);
    this.capturingSubject.next(true);
    
    const params = new HttpParams().set('side', side);
    
    return this.http.post<CaptureResponse>(
      Endpoints.RegulaDeviceEndpoints.captureDocument, 
      null, 
      { params }
    ).pipe(
      map(response => {
        console.log(`✓ Capture ${side} réussie:`, {
          success: response.success,
          imageSize: response.size,
          hasData: !!response.data
        });
        this.capturingSubject.next(false);
        return response;
      }),
      catchError(err => {
        console.error(`❌ Erreur capture ${side}:`, err);
        this.capturingSubject.next(false);
        const errorResponse: CaptureResponse = {
          success: false,
          error: err.error?.error || err.message || 'Erreur de capture'
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Scanne ET traite un document (capture + OCR automatique)
   * POST /api/regula/device/scan/document?side=xxx
   * @param side 'recto' ou 'verso'
   */
  scanAndProcessDocument(side: 'recto' | 'verso'): Observable<CaptureResponse> {
    console.log(`🔍 Démarrage scan et traitement ${side}...`);
    this.capturingSubject.next(true);
    
    const params = new HttpParams().set('side', side);
    
    return this.http.post<CaptureResponse>(
      Endpoints.RegulaDeviceEndpoints.scanDocument, 
      null, 
      { params }
    ).pipe(
      map(response => {
        if (response.success) {
          console.log(`✓ Scan et traitement ${side} réussi`);
          if (response.data) {
            console.log('📄 Données extraites:', response.data);
          } else {
            console.warn('⚠️ Aucune donnée OCR extraite');
          }
        }
        this.capturingSubject.next(false);
        return response;
      }),
      catchError(err => {
        console.error(`❌ Erreur scan ${side}:`, err);
        this.capturingSubject.next(false);
        const errorResponse: CaptureResponse = {
          success: false,
          error: err.error?.error || err.message || 'Erreur de scan'
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Capture une photo depuis la caméra de l'appareil
   * POST /api/regula/device/capture/photo
   */
  capturePhoto(): Observable<CaptureResponse> {
    console.log('📸 Démarrage capture photo...');
    this.capturingSubject.next(true);
    
    return this.http.post<CaptureResponse>(Endpoints.RegulaDeviceEndpoints.capturePhoto, null).pipe(
      map(response => {
        console.log('✓ Photo capturée:', {
          success: response.success,
          imageSize: response.size
        });
        this.capturingSubject.next(false);
        return response;
      }),
      catchError(err => {
        console.error('❌ Erreur capture photo:', err);
        this.capturingSubject.next(false);
        const errorResponse: CaptureResponse = {
          success: false,
          error: err.error?.error || err.message || 'Erreur de capture photo'
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Obtient le statut actuel de l'appareil (valeur synchrone)
   */
  getCurrentStatus(): RegulaDeviceStatusDto {
    return this.deviceStatusSubject.value;
  }

  /**
   * Vérifie si une capture est en cours
   */
  isCapturing(): boolean {
    return this.capturingSubject.value;
  }

  /**
   * Arrête le monitoring (utile pour la destruction du service)
   */
  stopMonitoring(): void {
    this.deviceStatusSubject.complete();
    this.capturingSubject.complete();
  }
}