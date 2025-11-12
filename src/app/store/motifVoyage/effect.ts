import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MotifVoyageService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import {MotifVoyage } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class MotifVoyageEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private motifVoyageService: MotifVoyageService,
    ) {}

   
 createMotifVoyage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createMotifVoyage),
            mergeMap((action: any) => {
                // ✅ Extraire uniquement les données sans la propriété "type"
                const { type, ...motifVoyage } = action;
                return this.motifVoyageService.createMotifVoyage(motifVoyage).pipe(
                    switchMap(value => {
                        return [
                            GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                            featureActions.loadMotifVoyage()
                        ];
                    }),
                    catchError((error: HttpErrorResponse) => {
                        console.error("===== EFFET - Erreur =====", error);
                        const errorMsg = error.error?.message || error.message || 'Erreur lors de la création';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                );
            })
        )
    );
  updateMotifVoyage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateMotifVoyage),
            mergeMap((motifVoyage: MotifVoyage) => {
                    return this.motifVoyageService.updateMotifVoyage(motifVoyage).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadMotifVoyage()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || error.message || 'Erreur lors de la modification';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                );
            })
        )
    );

   loadMotifVoyage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadMotifVoyage),
            mergeMap(() =>
                this.motifVoyageService.$getMotifVoyages().pipe(
                    switchMap(motifVoyages => [
                        featureActions.setMotifVoyage({motifVoyages})
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du chargement';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );

    
}