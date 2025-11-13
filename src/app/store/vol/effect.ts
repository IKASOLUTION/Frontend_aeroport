import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as volActions from './action';
import { VolService } from './service';

@Injectable()
export class VolEffects {

    constructor(
        private actions$: Actions,
        private volService: VolService
    ) {}

    loadVol$ = createEffect(() =>
        this.actions$.pipe(
            ofType(volActions.loadVol),
            switchMap(() =>
                this.volService.$getVols().pipe(
                    map(vols => volActions.loadVolSuccess({ vols })),
                    catchError(error => of(volActions.loadVolFailure({ error })))
                )
            )
        )
    );

   loadVolsByPeriode$ = createEffect(() =>
    this.actions$.pipe(
        ofType(volActions.loadVolsByPeriode),
        tap(action => console.log('Action déclenchée:', action)),
        switchMap(action =>
            this.volService.getVolsByPeriode(action.searchDto).pipe(
                tap(response => console.log('Réponse reçue:', response)),
                map(response =>  volActions.loadVolsByPeriodeSuccess({ 
                    vols: response.content, 
                    totalItems: response.totalElements 
                })),
                catchError(error => {
                    console.error('Erreur:', error);
                    return of(volActions.loadVolsByPeriodeFailure({ error }));
                })
            )
        )
    )
);

    createVol$ = createEffect(() =>
        this.actions$.pipe(
            ofType(volActions.createVol),
            switchMap(action =>
                this.volService.createVol(action.vol).pipe(
                    map(vol => volActions.createVolSuccess({ vol })),
                    catchError(error => of(volActions.createVolFailure({ error })))
                )
            )
        )
    );

    updateVol$ = createEffect(() =>
        this.actions$.pipe(
            ofType(volActions.updateVol),
            switchMap(action =>
                this.volService.updateVol(action.vol).pipe(
                    map(vol => volActions.updateVolSuccess({ vol })),
                    catchError(error => of(volActions.updateVolFailure({ error })))
                )
            )
        )
    );

    deleteVol$ = createEffect(() =>
        this.actions$.pipe(
            ofType(volActions.deleteVol),
            switchMap(action =>
                this.volService.deleteVol(action.vol).pipe(
                    map(() => volActions.deleteVolSuccess({ id: action.vol.id! })),
                    catchError(error => of(volActions.deleteVolFailure({ error })))
                )
            )
        )
    );

    changerStatusVol$ = createEffect(() =>
        this.actions$.pipe(
            ofType(volActions.changerStatusVol),
            switchMap(action =>
                this.volService.changerStatusVol(action.vol).pipe(
                    map(vol => volActions.changerStatusVolSuccess({ vol })),
                    catchError(error => of(volActions.changerStatusVolFailure({ error })))
                )
            )
        )
    );

    
}