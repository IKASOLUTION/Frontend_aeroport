import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { DonneeBiometriqueService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, map, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import { DonneeBiometrique } from "./model";
import { HttpErrorResponse } from "@angular/common/http";
import { Action } from "@ngrx/store";

@Injectable()
export class DonneeBiometriqueEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private donneeBiometriqueService: DonneeBiometriqueService
    ) {}

    createDonneeBiometrique$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createDonneeBiometrique),
            mergeMap((donneeBiometrique: DonneeBiometrique) =>
                this.donneeBiometriqueService.createDonneeBiometrique(donneeBiometrique).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})                ))
            ));

    updateDonneeBiometrique$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateDonneeBiometrique),
            mergeMap((donneeBiometrique: DonneeBiometrique) =>
                this.donneeBiometriqueService.updateDonneeBiometrique(donneeBiometrique).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                       // featureActions.loadDonneeBiometrique()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})

                ))
            ));

    loadDonneeBiometrique$ = createEffect(() =>
        this.actions$.pipe(
        ofType(featureActions.loadDonneeBiometrique),
        mergeMap(() =>
            this.donneeBiometriqueService.$getDonneeBiometriques().pipe(
                switchMap(donneeBiometriques => [
                   // GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                    featureActions.setDonneeBiometrique({donneeBiometriques})

                ]),
                catchError((error: HttpErrorResponse) => {
                   return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                )})
        ))

    ));


   loadDonneeBiometriquesByPeriode$ = createEffect(() =>
    this.actions$.pipe(
        ofType(featureActions.loadDonneeBiometriques),
        switchMap(action =>
            this.donneeBiometriqueService.getDonneeBiometriquesByPeriode(action.search).pipe(
                map(response =>
                    featureActions.loadDonneeBiometriquesByPeriodeSuccess({
                        donneeBiometriques: response.content,
                        totalItems: response.totalElements
                    })
                ),
                catchError(error =>
                    of(GlobalConfig.setStatus(StatusEnum.error, error.error?.error) as Action)
                )
            )
        )
    )
);



 deleteDonneeBiometrique$ = createEffect(() =>
    this.actions$.pipe(
            ofType(featureActions.deleteDonneeBiometrique),
            mergeMap((donneeBiometrique: DonneeBiometrique) =>
                this.donneeBiometriqueService.deleteDonneeBiometrique(donneeBiometrique).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadDonneeBiometrique()

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        console.log( error);
                       return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                    )})
                ))
            ));
}
