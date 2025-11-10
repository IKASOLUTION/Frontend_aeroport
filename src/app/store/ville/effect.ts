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
            mergeMap((ville: Ville) =>
                this.villeService.updateVille(ville).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadVille()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})

                ))
            ));

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
