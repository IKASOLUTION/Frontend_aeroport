import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Pays } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class PaysService {
constructor(private http: HttpClient) {}

$getPayss(): Observable<Pays[]> {
    return this.http.get<Pays[]>( `${GlobalConfig.getEndpoint(Endpoints.PAYS)}`).pipe(
      catchError(this.handleError())
    );
}
createPays(pays: Pays): Observable<any> {
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.PAYS)}`, pays);
  }

updatePays(pays: Pays): Observable<any> {
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.PAYS)}/${pays.id}`, pays);
}
deletePays(pays: Pays): Observable<any> {
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.PAYS)}/${pays.id}`, pays);
}
private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }
}
