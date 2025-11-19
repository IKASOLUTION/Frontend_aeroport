import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ListeNoireService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import {ListeNoire } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class ListeNoireEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private listeNoireService: ListeNoireService
    ) {}

   
 createListeNoire$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createListeNoire),
            mergeMap((action: any) => {
                // ✅ Extraire uniquement les données sans la propriété "type"
                const { type, ...listeNoire } = action;
                
                console.log("===== EFFET - Action complète =====", action);
                console.log("===== EFFET - Données nettoyées (sans type) =====", listeNoire);
                
                return this.listeNoireService.createListeNoire(listeNoire).pipe(
                    switchMap(value => {
                        console.log("===== EFFET - Réponse backend =====", value);
                        return [
                            GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                            featureActions.loadListeNoire()
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
  updateListeNoire$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.updateListeNoire),
            mergeMap((listeNoire: ListeNoire) => {
                console.log("===== EFFET UPDATE - Données =====", listeNoire);
                
                return this.listeNoireService.updateListeNoire(listeNoire).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadListeNoire()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || error.message || 'Erreur lors de la modification';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                );
            })
        )
    );

   loadListeNoire$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadListeNoire),
            mergeMap(() =>
                this.listeNoireService.$getListeNoires().pipe(
                    switchMap(listeNoires => [
                        featureActions.setListeNoire({listeNoires})
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du chargement';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );

     changerStatusListeNoire$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.changerStatusListeNoire),
            mergeMap((listeNoire: ListeNoire) =>
                this.listeNoireService.changerStatusListeNoire(listeNoire).pipe(
                    switchMap(value => [
                        GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                        featureActions.loadListeNoire()
                    ]),
                    catchError((error: HttpErrorResponse) => {
                        const errorMsg = error.error?.message || 'Erreur lors du changement de statut';
                        return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                    })
                )
            )
        )
    );

      deleteListeNoire$ = createEffect(() =>
            this.actions$.pipe(
                ofType(featureActions.deleteListeNoire),
                mergeMap((listeNoire: ListeNoire) =>
                    this.listeNoireService.deleteListeNoire(listeNoire).pipe(
                        switchMap(value => [
                            GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                            featureActions.loadListeNoire()
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