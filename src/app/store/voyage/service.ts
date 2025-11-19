import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Voyage } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class VoyageService {
constructor(private http: HttpClient) {}

$getVoyages(): Observable<Voyage[]> {
  
    // @FIXME: get request
    return this.http.get<Voyage[]>( `${GlobalConfig.getEndpoint(Endpoints.Voyage)}`).pipe(
      catchError(this.handleError())
    );
}

getVoyageById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(
        `${GlobalConfig.getEndpoint(Endpoints.Voyage)}/${id}`
    ).pipe(
        catchError(this.handleError())
    );
}

updateVoyage(voyage: Voyage): Observable<any> {
    console.log("===== SERVICE UPDATE - Données =====", voyage);
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}/${voyage.id}`, voyage);
}
deleteVoyage(voyage: Voyage): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.MotifVoyage)}/${voyage.id}`, voyage);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
