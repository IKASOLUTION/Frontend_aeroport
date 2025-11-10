import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Aeroport } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class AeroportService {
constructor(private http: HttpClient) {}

$getAeroports(): Observable<Aeroport[]> {
  
    // @FIXME: get request
    return this.http.get<Aeroport[]>( `${GlobalConfig.getEndpoint(Endpoints.AEROPORT)}`).pipe(
      catchError(this.handleError())
    );
}

createAeroport(aeroport: Aeroport): Observable<any> {
    console.log("===== SERVICE - Avant envoi =====", aeroport);
    console.log("===== SERVICE - JSON =====", JSON.stringify(aeroport));
    
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.AEROPORT)}`, aeroport).pipe(
        tap(response => console.log("===== SERVICE - Réponse =====", response)),
        catchError(error => {
            console.error("===== SERVICE - Erreur =====", error);
            throw error;
        })
    );
}

updateAeroport(aeroport: Aeroport): Observable<any> {
    console.log("===== SERVICE UPDATE - Données =====", aeroport);
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.AEROPORT)}/${aeroport.id}`, aeroport);
}
deleteAeroport(aeroport: Aeroport): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.AEROPORT)}/${aeroport.id}`, aeroport);
}

changerStatusAeroport(aeroport: Aeroport): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.AEROPORT)}${aeroport.id}`, aeroport);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
