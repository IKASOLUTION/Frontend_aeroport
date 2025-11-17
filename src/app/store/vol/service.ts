import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PageResponse, SearchDto, Vol } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class VolService {
constructor(private http: HttpClient) {}

$getVols(): Observable<Vol[]> {
  
    // @FIXME: get request
    return this.http.get<Vol[]>( `${GlobalConfig.getEndpoint(Endpoints.VOL)}`).pipe(
      catchError(this.handleError())
    );
}

createVol(vol: Vol): Observable<any> {
     // @FIXME: post request
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.VOL)}`, vol);
}

updateVol(vol: Vol): Observable<any> {
     // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.VOL)}/${vol.id}`, vol);
}
deleteVol(vol: Vol): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.VOL)}/${vol.id}`, vol);
}

changerStatusVol(vol: Vol): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.VOL)}/${vol.id}`, vol);
}

getVolsByPeriode(searchDto: SearchDto): Observable<PageResponse<Vol>> {
         // @FIXME: put request
        const body = {
            dateDebut: this.formatDate(searchDto.dateDebut),
            dateFin: this.formatDate(searchDto.dateFin),
            statutVols: searchDto.statutVols || [],
            page: searchDto.page || 0,
            size: searchDto.size || 10,
            sort: searchDto.sortBy || 'dateDepart,desc'
        };

        console.log('=== Service - Body envoyé ===', body);

        return this.http.put<PageResponse<Vol>>(`${GlobalConfig.getEndpoint(Endpoints.VOL)}/periode`, body);
    }



     private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
