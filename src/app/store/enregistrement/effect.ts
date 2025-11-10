import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EnregistrementService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import { Enregistrement } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class EnregistrementEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private enregistrementService: EnregistrementService
    ) {}

    createEnregistrement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createEnregistrement),
            mergeMap((enregistrement: Enregistrement) =>
                this.enregistrementService.createEnregistrement(enregistrement).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.selecteEnregistrement({enregistrement: value})
                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})                ))
            ));

    updateEnregistrement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateEnregistrement),
            mergeMap((enregistrement: Enregistrement) =>
                this.enregistrementService.updateEnregistrement(enregistrement).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadEnregistrement()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})

                ))
            ));

    loadEnregistrement$ = createEffect(() =>
        this.actions$.pipe(
        ofType(featureActions.loadEnregistrement),
        mergeMap(() =>
            this.enregistrementService.$getEnregistrements().pipe(
                switchMap(enregistrements => [
                   // GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    featureActions.setEnregistrement({enregistrements})

                ]),
                catchError((error: HttpErrorResponse) => {
                   return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                )})
        ))

    ));


   

 deleteEnregistrement$ = createEffect(() =>
    this.actions$.pipe(
            ofType(featureActions.deleteEnregistrement),
            mergeMap((enregistrement: Enregistrement) =>
                this.enregistrementService.deleteEnregistrement(enregistrement).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadEnregistrement()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        console.log( error);
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})
                ))
            ));
}
