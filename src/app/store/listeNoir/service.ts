import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {ListeNoire } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class ListeNoireService {
constructor(private http: HttpClient) {}

$getListeNoires(): Observable<ListeNoire[]> {
  
    // @FIXME: get request
    return this.http.get<ListeNoire[]>( `${GlobalConfig.getEndpoint(Endpoints.ListeNoire)}`).pipe(
      catchError(this.handleError())
    );
}

createListeNoire(listeNoire: ListeNoire): Observable<any> {
    console.log("===== SERVICE - Avant envoi =====", listeNoire);
    console.log("===== SERVICE - JSON =====", JSON.stringify(listeNoire));
    
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.ListeNoire)}`, listeNoire).pipe(
        tap(response => console.log("===== SERVICE - Réponse =====", response)),
        catchError(error => {
            console.error("===== SERVICE - Erreur =====", error);
            throw error;
        })
    );
}

updateListeNoire(listeNoire: ListeNoire): Observable<any> {
    console.log("===== SERVICE UPDATE - Données =====", listeNoire);
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.ListeNoire)}/${listeNoire.id}`, listeNoire);
}
deleteListeNoire(listeNoire: ListeNoire): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.ListeNoire)}/${listeNoire.id}`, listeNoire);
}

changerStatusListeNoire(listeNoire: ListeNoire): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.ListeNoire)}${listeNoire.id}`, listeNoire);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
