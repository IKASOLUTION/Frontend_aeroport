import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Ville } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class VilleService {
constructor(private http: HttpClient) {}

$getVilles(): Observable<Ville[]> {
    return this.http.get<Ville[]>( `${GlobalConfig.getEndpoint(Endpoints.VILLE)}`).pipe(
      catchError(this.handleError())
    );
}
createVille(ville: Ville): Observable<any> {
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.VILLE)}`, ville);
  }

updateVille(ville: Ville): Observable<any> {
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.VILLE)}/${ville.id}`, ville);
}
deleteVille(ville: Ville): Observable<any> {
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.VILLE)}/${ville.id}`, ville);
}
private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }
}
