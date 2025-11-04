import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "./model";
import { catchError, map, Observable, throwError } from "rxjs";
import { GlobalConfig } from "src/app/config/global.config";
import { Endpoints } from "src/app/config/module.endpoints";


@Injectable({providedIn: 'root'})
export class UserService {
constructor(private http: HttpClient) {}

$getUsers(): Observable<User[]> {
  
    // @FIXME: get request
    return this.http.get<User[]>( `${GlobalConfig.getEndpoint(Endpoints.USER)}`).pipe(
      catchError(this.handleError())
    );
}

createUser(user: User): Observable<any> {
    // @FIXME: post request
    return this.http.post(`${GlobalConfig.getEndpoint(Endpoints.USER)}`, user);
  }

updateUser(user: User): Observable<any> {
    // @FIXME: post request
    return this.http.put(`${GlobalConfig.getEndpoint(Endpoints.USER)}${user.id}`, user);
}
deleteAdherent(user: User): Observable<any> {
    // @FIXME: post request
    return this.http.patch(`${GlobalConfig.getEndpoint(Endpoints.USER)}/${user.id}`, user);
}


private handleError<T>() {
    return (error: HttpErrorResponse) => {
        return throwError(() => error.message || 'Something went wrong');
    };
  }

}
