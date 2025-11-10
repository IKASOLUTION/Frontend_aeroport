import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AeroportService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import { Aeroport } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class AeroportEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private aeroportService: AeroportService
    ) {}

   
 createAeroport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createAeroport),
            mergeMap((action: any) => {
                // ✅ Extraire uniquement les données sans la propriété "type"
                const { type, ...aeroport } = action;
                
                console.log("===== EFFET - Action complète =====", action);
                console.log("===== EFFET - Données nettoyées (sans type) =====", aeroport);
                
                return this.aeroportService.createAeroport(aeroport).pipe(
                    switchMap(value => {
                        console.log("===== EFFET - Réponse backend =====", value);
                        return [
                            GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                            featureActions.loadAeroport()
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
  updateAeroport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateAeroport),
            mergeMap((aeroport: Aeroport) => {
                console.log("===== EFFET UPDATE - Données =====", aeroport);
                
                return this.aeroportService.updateAeroport(aeroport).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadAeroport()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || error.message || 'Erreur lors de la modification';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                );
            })
        )
    );

   loadAeroport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadAeroport),
            mergeMap(() =>
                this.aeroportService.$getAeroports().pipe(
                    switchMap(aeroports => [
                        featureActions.setAeroport({aeroports})
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du chargement';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );

     changerStatusAeroport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.changerStatusAeroport),
            mergeMap((aeroport: Aeroport) =>
                this.aeroportService.changerStatusAeroport(aeroport).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadAeroport()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du changement de statut';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );
}