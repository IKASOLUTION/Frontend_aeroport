import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CompagnieService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import {Compagnie } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class CompagnieEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private compagnieService: CompagnieService
    ) {}

   
    createCompagnie$ = createEffect(() =>
         this.actions$.pipe(
             ofType(featureActions.createCompagnie),
             mergeMap((compagnie: Compagnie) =>
                 this.compagnieService.createCompagnie(compagnie).pipe(
                     switchMap(value => [
                         GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                         featureActions.loadCompagnie()
                     ]),
                     catchError((error: HttpErrorResponse) => {
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                     )})                ))
             ));
 
    updateCompagnie$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateCompagnie),
            mergeMap((compagnie: Compagnie) =>
                this.compagnieService.updateCompagnie(compagnie).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadCompagnie()
                        
                    ]),
                    catchError(error => of(GlobalConfig.setStatus(StatusEnum.error, error)))
                    
                ))
            ));
    loadCompagnie$ = createEffect(() =>
        this.actions$.pipe(
        ofType(featureActions.loadCompagnie),
        mergeMap(() =>
            this.compagnieService.$getCompagnies().pipe(
                switchMap(compagnies => [
                  //  GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    featureActions.setCompagnie({compagnies})
                                
                ]),
            catchError(error => of(GlobalConfig.setStatus(StatusEnum.error, error.error)))
            
        ))
                    
    ));

     changerStatusCompagnie$ = createEffect(() =>
           this.actions$.pipe(
            ofType(featureActions.changerStatusCompagnie),
            mergeMap((compagnie: Compagnie) =>
                this.compagnieService.changerStatusCompagnie(compagnie).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadCompagnie()
                        
                    ]),
                    catchError(error => of(GlobalConfig.setStatus(StatusEnum.error, error)))
                    
                ))
            ));
}