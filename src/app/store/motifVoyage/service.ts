import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {MotifVoyage } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class MotifVoyageService {
constructor(private http: HttpClient) {}

$getMotifVoyages(): Observable<MotifVoyage[]> {
  
    // @FIXME: get request
    return this.http.get<MotifVoyage[]>( `${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}`).pipe(
      catchError(this.handleError())
    );
}

createMotifVoyage(motifVoyage: MotifVoyage): Observable<any> {
   
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}`, motifVoyage).pipe(
        tap(response => console.log("===== SERVICE - Réponse =====", response)),
        catchError(error => {
            console.error("===== SERVICE - Erreur =====", error);
            throw error;
        })
    );
}

updateMotifVoyage(motifVoyage: MotifVoyage): Observable<any> {
    console.log("===== SERVICE UPDATE - Données =====", motifVoyage);
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}/${motifVoyage.id}`, motifVoyage);
}
deleteMotifVoyage(motifVoyage: MotifVoyage): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}/${motifVoyage.id}`, motifVoyage);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
