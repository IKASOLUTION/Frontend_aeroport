import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Enregistrement, EnregistrementList, MotifVoyage, TypeDocument } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class EnregistrementService {
constructor(private http: HttpClient) {}

$getEnregistrements(): Observable<Enregistrement[]> {

  
    // @FIXME: get request
    return this.http.get<Enregistrement[]>( `${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}`).pipe(
      catchError(this.handleError())
    );
}

createEnregistrement(enregistrement: Enregistrement): Observable<any> {
  const formData = this.convertToFormData(enregistrement);
    
  return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}`, formData);
}

private convertToFormData(enregistrement: Enregistrement): FormData {
  const formData = new FormData();
  
  // Parcourir toutes les propriétés
  Object.keys(enregistrement).forEach(key => {
    const value = enregistrement[key as keyof Enregistrement];
    
    if (value !== null && value !== undefined) {
      // Gérer les champs image (base64 ou File)
      if (key === 'photoProfil' || key === 'imageRecto' || key === 'imageVerso') {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          // Convertir base64 en File
          const file = this.base64ToFile(value, `${key}.jpg`);
          formData.append(key, file);
        } else if (value instanceof File) {
          // C'est déjà un File
          formData.append(key, value);
        }
      } 
      // Champs enum : convertir en string
      else if (typeof value === 'number' && (key === 'typeDocument' || key === 'motifVoyage' || key === 'etatVoyage')) {
        // convertir la valeur enum numérique en nom de l’enum
        formData.append(key, (enregistrement[key as keyof Enregistrement] as any).toString());
        // ou mieux : Object.keys(enum)[value] pour récupérer le nom
        const enumObj = this.getEnumByKey(key);
         formData.append(key, enumObj[value as number]);
      }
      // Autres champs
      else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
}

private base64ToFile(base64String: string, filename: string): File {
  // Extraire le type MIME et les données
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

updateEnregistrement(enregistrement: Enregistrement): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/${enregistrement.id}`, enregistrement);
}
deleteEnregistrement(enregistrement: Enregistrement): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/${enregistrement.id}`, enregistrement);
}

private getEnumByKey(key: string): any {
  switch(key) {
    case 'typeDocument':
      return TypeDocument;
    case 'motifVoyage':
      return MotifVoyage;
   
    default:
      return {};
  }
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
