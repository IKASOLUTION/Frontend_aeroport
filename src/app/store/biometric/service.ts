import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DonneeBiometrique, DonneeBiometriqueList } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class DonneeBiometriqueService {
constructor(private http: HttpClient) {}

$getDonneeBiometriques(): Observable<DonneeBiometrique[]> {

    // @FIXME: get request
    return this.http.get<DonneeBiometrique[]>( `${GlobalConfig.getEndpoint(Endpoints.BIOMETRIC)}`).pipe(
      catchError(this.handleError())
    );
}



updateDonneeBiometrique(donneeBiometrique: DonneeBiometrique): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.BIOMETRIC)}/${donneeBiometrique.id}`, donneeBiometrique);
}
deleteDonneeBiometrique(donneeBiometrique: DonneeBiometrique): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.BIOMETRIC)}/${donneeBiometrique.id}`, donneeBiometrique);
}

createDonneeBiometrique(donneeBiometrique: DonneeBiometrique): Observable<any> {
  const formData = this.convertToFormData(donneeBiometrique);
  return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.BIOMETRIC)}`, formData);
}

private convertToFormData(donneeBiometrique: DonneeBiometrique): FormData {
  const formData = new FormData();
  
  // Ajouter l'ID si présent
  if (donneeBiometrique.id !== undefined) {
    formData.append('id', donneeBiometrique.id.toString());
  }
  
  // Ajouter les booléens
  if (donneeBiometrique.empreinteDroite !== undefined) {
    formData.append('empreinteDroite', donneeBiometrique.empreinteDroite.toString());
  }
  if (donneeBiometrique.empreinteGauche !== undefined) {
    formData.append('empreinteGauche', donneeBiometrique.empreinteGauche.toString());
  }
  if (donneeBiometrique.empreintePouces !== undefined) {
    formData.append('empreintePouces', donneeBiometrique.empreintePouces.toString());
  }
  
  // Ajouter l'ID de l'enregistrement
  if (donneeBiometrique.informationPersonnelleId !== undefined) {
    formData.append('informationPersonnelleId', donneeBiometrique.informationPersonnelleId.toString());
  }
  
  // Ajouter la photo
  if (donneeBiometrique.photoBiometrique) {
    if (donneeBiometrique.photoBiometrique instanceof File) {
      formData.append('photoBiometrique', donneeBiometrique.photoBiometrique);
    } else if (typeof donneeBiometrique.photoBiometrique === 'string') {
      const file = this.base64ToFile(donneeBiometrique.photoBiometrique, 'photo.jpg');
      formData.append('photoBiometrique', file);
    }
  }
  
  return formData;
}

private base64ToFile(base64String: string, filename: string): File {
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



private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
