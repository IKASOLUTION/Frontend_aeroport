import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { VoyageService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import {Voyage } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class VoyageEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private voyageService: VoyageService,
    ) {}

   
 

   loadVoyage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadVoyage),
            mergeMap(() =>
                this.voyageService.$getVoyages().pipe(
                    switchMap(voyages => [
                        featureActions.setVoyage({voyages})
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du chargement';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );

    getVoyage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.getVoyage),
            mergeMap((voyage: Voyage) => {
                    return this.voyageService.getVoyageById(voyage.id!).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success),
                        // featureActions.loadVoyage()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || error.message || 'Erreur lors de la modification';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                );
            })
        )
    );
     

    
}