import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EnregistrementService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, map, mergeMap, of, switchMap, tap } from "rxjs";
import * as featureActions from './action';
import { Enregistrement } from "./model";
import { HttpErrorResponse } from "@angular/common/http";
import { SearchDto } from "../vol/model";

@Injectable()
export class EnregistrementEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private enregistrementService: EnregistrementService
    ) { }

    createEnregistrement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createEnregistrement),
            mergeMap((enregistrement: Enregistrement) =>
                this.enregistrementService.createEnregistrement(enregistrement).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.selecteEnregistrement({ enregistrement: value })
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                        )
                    })))
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
                        )
                    })

                ))
        ));

    loadEnregistrement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadEnregistrement),
            mergeMap(() =>
                this.enregistrementService.$getEnregistrements().pipe(
                    switchMap(enregistrements => [
                        // GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.setEnregistrement({ enregistrements })

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                        )
                    })
                ))

        ));

    loadEnregistrementsByPeriode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadEnregistrementsByPeriode),
            tap(action => console.log('Action déclenchée:', action)),
            switchMap(action =>
                this.enregistrementService.getEnregistrementsByPeriode(action.searchDto).pipe(
                    tap(response => console.log('Réponse reçue:', response)),
                    map(response => featureActions.loadEnregistrementsByPeriodeSuccess({
                        enregistrements: response.content,
                        totalItems: response.totalElements
                    })),
                    catchError(error => {
                        console.error('Erreur:', error);
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                        );
                    })
                )
            )
        )
    );


    loadVoyageurAttenteByPeriode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadVoyageurAttenteByPeriode),
            tap(action => console.log('Action déclenchée:', action)),
            switchMap(action =>
                this.enregistrementService.getVoyageurAttenteByPeriode(action.searchDto).pipe(
                    tap(response => console.log('Réponse reçue:', response)),
                    map(response => featureActions.loadVoyageurAttenteByPeriodeSuccess({
                        voyageurAttentes: response.content,
                        totalItems: response.totalElements
                    })),
                    catchError(error => {
                        console.error('Erreur:', error);
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                        );
                    })
                )
            )
        )
    );


    deleteEnregistrementAttente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.deleteEnregistrementAttente),
            mergeMap(({ enregistrement, search }) =>
                this.enregistrementService.deleteEnregistrement(enregistrement).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadVoyageurAttenteByPeriode({ searchDto: search })

                    ]),
                    catchError((error: HttpErrorResponse) => {
                        console.log(error);
                        return of(GlobalConfig.setStatus(StatusEnum.error, error.error.error)
                        )
                    })
                ))
        ));




    // NE FAITES PAS ÇA - C'est une mauvaise pratique
    listeVols$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.listeVols),
            switchMap(action =>
                this.enregistrementService.ListVols(action.numeroDocument).pipe(
                    map(response => featureActions.listeVolsSuccess({
                        enregistrements: response  // ou response.data
                    })),
                    catchError(error => of(featureActions.listeVolsFailure({
                        error: error.message || 'Une erreur est survenue'
                    })))
                )
            )
        )
    );
}
