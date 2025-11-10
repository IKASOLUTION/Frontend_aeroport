import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {  Compagnie } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class CompagnieService {
constructor(private http: HttpClient) {}

$getCompagnies(): Observable<Compagnie[]> {
  
    // @FIXME: get request
    return this.http.get<Compagnie[]>( `${GlobalConfig.getEndpoint(Endpoints.COMPAGNIE)}`).pipe(
      catchError(this.handleError())
    );
}

createCompagnie(compagnie: Compagnie): Observable<any> {
    // @FIXME: post request
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.COMPAGNIE)}`, compagnie);
  }

updateCompagnie(compagnie: Compagnie): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.COMPAGNIE)}${compagnie.id}`, compagnie);
}
deleteCompagnie(compagnie: Compagnie): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.COMPAGNIE)}/${compagnie.id}`, compagnie);
}

changerStatusCompagnie(compagnie: Compagnie): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.COMPAGNIE)}${compagnie.id}`, compagnie);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
