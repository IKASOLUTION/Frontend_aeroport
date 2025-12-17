import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Enregistrement, EnregistrementList, MotifVoyage, StatutVoyageur, TypeDocument } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";
import { PageResponse, SearchDto } from "../vol/model";


@Injectable({ providedIn: 'root' })
export class EnregistrementService {
  constructor(private http: HttpClient) { }

  $getEnregistrements(): Observable<Enregistrement[]> {


    // @FIXME: get request
    return this.http.get<Enregistrement[]>(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}`).pipe(
      catchError(this.handleError())
    );
  }

  createEnregistrement(enregistrement: Enregistrement): Observable<any> {
    const formData = this.convertToFormData(enregistrement);
    console.log('FormData pour enregistrement:', formData);
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
        else if (typeof value === 'number' && (key === 'typeDocument' || key === 'motifVoyage' || key === 'etatVoyage' || key === 'statut')) {
          // convertir la valeur enum numérique en nom de l’enum
          //formData.append(key, (enregistrement[key as keyof Enregistrement] as any).toString());
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

  getEnregistrementsByPeriode(searchDto: SearchDto): Observable<PageResponse<Enregistrement>> {
    // @FIXME: put request
    const body = {
      dateDebut: this.formatDate(searchDto.dateDebut),
      dateFin: this.formatDate(searchDto.dateFin),
      status: searchDto.status,
      aeroportId: searchDto.aeroportId,
      page: searchDto.page || 0,
      size: searchDto.size || 10,
      sort: searchDto.sortBy || 'dateDepart,desc'
    };


    return this.http.put<PageResponse<Enregistrement>>(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/periode`, body);
  }


  getVoyageurAttenteByPeriode(searchDto: SearchDto): Observable<PageResponse<Enregistrement>> {
    // @FIXME: put request
    const body = {
      dateDebut: this.formatDate(searchDto.dateDebut),
      dateFin: this.formatDate(searchDto.dateFin),
      // status: searchDto.status,
      aeroportId: searchDto.aeroportId,
      page: searchDto.page || 0,
      size: searchDto.size || 10,
      sort: searchDto.sortBy || 'dateDepart,desc'
    };


    return this.http.put<PageResponse<Enregistrement>>(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/periode/voyageur-attente`, body);
  }



   getPreEnregistrementByPeriode(searchDto: SearchDto): Observable<PageResponse<Enregistrement>> {
    // @FIXME: put request
    const body = {
      dateDebut: this.formatDate(searchDto.dateDebut),
      dateFin: this.formatDate(searchDto.dateFin),
      page: searchDto.page || 0,
      size: searchDto.size || 10,
      sort: searchDto.sortBy || 'dateDepart,desc'
    };
    return this.http.put<PageResponse<Enregistrement>>(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/pre-enrgistrement/periode`, body);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return this.http.delete(`${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/${enregistrement.id}`);
  }

  private getEnumByKey(key: string): any {
    switch (key) {
      case 'typeDocument':
        return TypeDocument;
      case 'motifVoyage':
        return MotifVoyage;
        case 'statut':
        return StatutVoyageur;

      default:
        return {};
    }
  }


  private handleError<T>() {
    return (error: HttpErrorResponse) => {
      return throwError(() => error.message || 'Something went wrong');
    };
  }







ListVols(numeroDocument: String): Observable<Enregistrement[]> {
    return this.http.get<Enregistrement[]>(
        `${GlobalConfig.getEndpoint(Endpoints.ENREIGISTREMENT)}/document/${numeroDocument}`
    );
}
}
