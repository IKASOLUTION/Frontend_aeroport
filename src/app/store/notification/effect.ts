import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {NotificationService } from "./service";
import { GlobalConfig } from "src/app/config/global.config";
import { StatusEnum } from "../global-config/model";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import * as featureActions from './action';
import {Notification } from "./model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class NotificationEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private notificationService: NotificationService,
    ) {}

   
 createNotification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.createNotification),
            mergeMap((action: any) => {
                const { type, ...notification } = action;
                return this.notificationService.createNotification(notification).pipe(
                    switchMap(value => {
                        return [
                            GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                            featureActions.loadNotification()
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
  updateNotification$ = createEffect(() =>
         this.actions$.pipe(
             ofType(featureActions.updateNotification),
             mergeMap((notification: Notification) => {
                     return this.notificationService.updateNotification(notification).pipe(
                     switchMap(value => [
                         GlobalConfig.setStatus(StatusEnum.success, this.successMsg),
                         featureActions.loadNotification()
                     ]),
                     catchError((error: HttpErrorResponse) => {
                         const errorMsg = error.error?.message || error.message || 'Erreur lors de la modification';
                         return of(GlobalConfig.setStatus(StatusEnum.error, errorMsg));
                     })
                 );
             })
         )
     );

   loadNotification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(featureActions.loadNotification),
            mergeMap(() =>
                this.notificationService.$getNotifications().pipe(
                    switchMap(notifications => [
                        featureActions.setNotification({notifications})
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