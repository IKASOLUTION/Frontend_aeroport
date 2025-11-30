import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegulaService {

  constructor(private http: HttpClient) { }

  verifyDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `api/regula/verify`;
    console.log('🔄 Appel Regula vers:', endpoint);

    return this.http.post<any>(endpoint, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Extrait les informations structurées depuis la réponse Regula
   */
  extractDocumentInfo(regulaResponse: any): any {
    try {
      const data = typeof regulaResponse === 'string' 
        ? JSON.parse(regulaResponse) 
        : regulaResponse;

      console.log('🔍 Extraction données Regula:', data);

      // Extraction pour passeport/CNI
      const documentInfo = {
        // Informations personnelles
        nomFamille: this.findField(data, 'nom') || this.findField(data, 'lastName') || this.findField(data, 'surname'),
        prenom: this.findField(data, 'prenom') || this.findField(data, 'firstName') || this.findField(data, 'givenName'),
        dateNaissance: this.formatDateForForm(this.findField(data, 'dateNaissance') || this.findField(data, 'birthDate')),
        lieuNaissance: this.findField(data, 'lieuNaissance') || this.findField(data, 'birthPlace'),
        nationalite: this.findField(data, 'nationalite') || this.findField(data, 'nationality'),
        
        // Informations document
        numeroDocument: this.findField(data, 'numeroDocument') || this.findField(data, 'documentNumber'),
        dateDelivrance: this.formatDateForForm(this.findField(data, 'dateDelivrance') || this.findField(data, 'issueDate')),
        lieuDelivrance: this.findField(data, 'lieuDelivrance') || this.findField(data, 'issuePlace'),
        
        // Autres champs
        sexe: this.findField(data, 'sexe') || this.findField(data, 'sex'),
        dateExpiration: this.formatDateForForm(this.findField(data, 'dateExpiration') || this.findField(data, 'expiryDate'))
      };

      console.log('✅ Données extraites:', documentInfo);
      return documentInfo;

    } catch (error) {
      console.error('❌ Erreur extraction Regula:', error);
      return {};
    }
  }

  /**
   * Recherche récursive d'un champ dans l'objet Regula
   */
  private findField(obj: any, fieldName: string): any {
    if (!obj || typeof obj !== 'object') return null;

    // Recherche directe
    if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
      return obj[fieldName];
    }

    // Recherche dans les sous-objets
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        const result = this.findField(obj[key], fieldName);
        if (result) return result;
      }
    }

    return null;
  }

  /**
   * Formate la date pour le formulaire (YYYY-MM-DD)
   */
  private formatDateForForm(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Gestion des formats de date communs Regula
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  }

  private handleError(error: any) {
    console.error('❌ Erreur RegulaService:', error);
    let errorMessage = 'Erreur lors de la lecture du document';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}