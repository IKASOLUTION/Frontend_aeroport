import { GlobalConfig } from '@/config/global.config';
import { Endpoints } from '@/config/module.endpoints';
import { MenuAction } from '@/modeles/menuAction';
import { ModuleParam } from '@/modeles/moduleParam';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type EntityResponseType = HttpResponse<ModuleParam>;
type EntityArrayResponseType = HttpResponse<ModuleParam[]>;

@Injectable({
  providedIn: 'root'
})
export class ModuleParamService {
  
  constructor(protected http: HttpClient) {}
  
  create(moduleParam: ModuleParam): Observable<EntityResponseType> {
    console.log('Creating module param...', moduleParam);
      return this.http.post<ModuleParam>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}`, moduleParam, { observe: 'response' });
  }
  
  update(moduleParam: ModuleParam): Observable<EntityResponseType> {
      return this.http.put<ModuleParam>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}/${moduleParam.id}`, moduleParam, { observe: 'response' });
  }
  
  deleteAll(moduleParams: ModuleParam[]): Observable<EntityArrayResponseType> {
      return this.http.put<ModuleParam[]>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}/all`, moduleParams, { observe: 'response' });
  }
  
  find(id: number): Observable<EntityResponseType> {
      return this.http.get<ModuleParam>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}/${id}`, { observe: 'response' });
  }

  findMenuByModule(idModule: number): Observable<HttpResponse<MenuAction[]>> {
    return this.http.get<MenuAction[]>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}/menus/${idModule}`, { observe: 'response' });
}
  
  query(req?: any): Observable<EntityArrayResponseType> {
      return this.http.get<ModuleParam[]>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}`, { observe: 'response' });
  }
  
  delete(id: number): Observable<HttpResponse<any>> {
      return this.http.delete<any>(`${GlobalConfig.getEndpoint(Endpoints.MODULE)}/${id}`, { observe: 'response' });
  }
}
