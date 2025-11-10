import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';

import { HttpErrorResponse } from "@angular/common/http";
import { PaysService } from "./service";
import { Pays } from "./model";

@Injectable()
export class PaysEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private paysService: PaysService
    ) {}

    createPays$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createPays),
            mergeMap((pays: Pays) =>
                this.paysService.createPays(pays).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadPays()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})                ))
            ));

    updatePays$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updatePays),
            mergeMap((pays: Pays) =>
                this.paysService.updatePays(pays).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadPays()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})

                ))
            ));

    loadPays$ = createEffect(() =>
        this.actions$.pipe(
        ofType(featureActions.loadPays),
        mergeMap(() =>
            this.paysService.$getPayss().pipe(
                switchMap(payss => [
                   // GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    featureActions.setPays({payss})

                ]),
                catchError((error: HttpErrorResponse) => {
                   return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                )})
        ))

    ));

 deletePays$ = createEffect(() =>
    this.actions$.pipe(
            ofType(featureActions.deletePays),
            mergeMap((pays: Pays) =>
                this.paysService.deletePays(pays).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadPays()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        console.log( error);
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})
                ))
            ));
}
