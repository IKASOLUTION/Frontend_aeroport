import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuAction } from '@/modeles/menuAction';

type EntityResponseType = HttpResponse<MenuAction>;
type EntityArrayResponseType = HttpResponse<MenuAction[]>;

@Injectable({
  providedIn: 'root'
})
export class MenuActionService {
    // Use a relative API path so the dev-server proxy (proxy.conf.json) can forward requests
    public resourceUrl = '/api/menuActions';

  constructor(protected http: HttpClient) {}
  
  create(menuAction: MenuAction): Observable<EntityResponseType> {
      return this.http.post<MenuAction>(this.resourceUrl, menuAction, { observe: 'response' });
  }
  
  update(menuAction: MenuAction): Observable<EntityResponseType> {
      return this.http.put<MenuAction>(`${this.resourceUrl}/${menuAction.id}`, menuAction, { observe: 'response' });
  }
  
  deleteAll(menuActions: MenuAction[]): Observable<EntityArrayResponseType> {
      return this.http.put<MenuAction[]>(`${this.resourceUrl}/all`, menuActions, { observe: 'response' });
  }
  
  find(id: number): Observable<EntityResponseType> {
      return this.http.get<MenuAction>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
  
  query(req?: any): Observable<EntityArrayResponseType> {
      return this.http.get<MenuAction[]>(this.resourceUrl, { observe: 'response' });
  }
  
  delete(id: number): Observable<HttpResponse<any>> {
      return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
