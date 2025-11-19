import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';

import { HttpErrorResponse } from "@angular/common/http";
import {VilleService } from "./service";
import {Ville } from "./model";

@Injectable()
export class VilleEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private villeService: VilleService
    ) {}

    createVille$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createVille),
            mergeMap((ville: Ville) =>
                this.villeService.createVille(ville).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadVille()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})                ))
            ));

   updateVille$ = createEffect(() =>
    this.actions$.pipe(
        ofType(featureActions.updateVille),
        mergeMap((action) => {  // Changé : on reçoit l'action complète
            console.log("===== EFFECT - Action complète =====", action);
            console.log("===== EFFECT - Ville à mettre à jour =====", action.ville);
            
            return this.villeService.updateVille(action.ville).pipe(
                switchMap(value => {
                    console.log("===== EFFECT - Success =====", value);
                    return [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadVille()
                    ];
                }),
                catchError((error: HttpErrorResponse) => {
                    console.error("===== EFFECT - Error =====", error);
                    const errorMsg = error.error?.message || error.error?.error || error.message || 'Erreur lors de la modification';
                    return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                })
            );
        })
    )
);

    loadVille$ = createEffect(() =>
        this.actions$.pipe(
        ofType(featureActions.loadVille),
        mergeMap(() =>
            this.villeService.$getVilles().pipe(
                switchMap(villes => [
                   // GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    featureActions.setVille({villes})

                ]),
                catchError((error: HttpErrorResponse) => {
                   return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                )})
        ))

    ));

 deleteVille$ = createEffect(() =>
    this.actions$.pipe(
            ofType(featureActions.deleteVille),
            mergeMap((ville: Ville) =>
                this.villeService.deleteVille(ville).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadVille()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        console.log( error);
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})
                ))
            ));
}
