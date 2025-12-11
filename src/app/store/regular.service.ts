import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegulaService {

  constructor(private http: HttpClient) { }

  /**
   * Envoie le document au backend pour traitement
   */
  verifyDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `api/documents/process`;
    console.log('🔄 Appel Regula vers:', endpoint);

    return this.http.post<any>(endpoint, formData).pipe(
      tap(response => {
        console.log('📥 Réponse brute du backend:', response);
        console.log('📥 Type de réponse:', typeof response);
        console.log('📥 Clés disponibles:', Object.keys(response));
      }),
      map(response => {
        // Le backend retourne directement un objet DocumentData
        // Pas besoin de parser, on retourne tel quel
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('❌ Erreur RegulaService:', error);
    console.error('❌ Status:', error.status);
    console.error('❌ Error body:', error.error);
    
    let errorMessage = 'Erreur lors de la lecture du document';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 403) {
      errorMessage = 'Problème de licence Regula';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur lors du traitement du document';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}