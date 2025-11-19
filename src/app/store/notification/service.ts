import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Notification } from "./model";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class NotificationService {
constructor(private http: HttpClient) {}

$getNotifications(): Observable<Notification[]> {
  
    // @FIXME: get request
    return this.http.get<Notification[]>( `${GlobalConfig.getEndpoint(Endpoints.Notification)}`).pipe(
      catchError(this.handleError())
    );
}

createNotification(notification: Notification): Observable<any> {
   
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.Notification)}`, notification).pipe(
        tap(response => console.log("===== SERVICE - Réponse =====", response)),
        catchError(error => {
            console.error("===== SERVICE - Erreur =====", error);
            throw error;
        })
    );
}

updateNotification(notification: Notification): Observable<any> {
  return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.Notification)}/${notification.id}`, notification);
}
deleteNotification(notification: Notification): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.Notification)}/${notification.id}`, notification);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
