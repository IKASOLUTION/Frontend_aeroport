import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as voyageAction from './action';
import { VoyageService } from './service';


@Injectable()
export class VoyageEffects {


    private successMsg = 'Opération reussie !';
    constructor(
        private actions$: Actions,
        private voyageService: VoyageService,
    ) {}

   
 

     loadVoyage$ = createEffect(() =>
           this.actions$.pipe(
               ofType(voyageAction.loadVoyage),
               switchMap(() =>
                   this.voyageService.$getVoyages().pipe(
                       map(voyages => voyageAction.loadVoyageSuccess({ voyages })),
                       catchError(error => of(voyageAction.loadVoyageFailure({ error })))
                   )
               )
           )
       );
   
      loadVoyagesByPeriode$ = createEffect(() =>
       this.actions$.pipe(
           ofType(voyageAction.loadVoyagesByPeriode),
           tap(action => console.log('Action déclenchée:', action)),
           switchMap(action =>
               this.voyageService.getVoyagesByPeriode(action.searchDto).pipe(
                   tap(response => console.log('Réponse reçue:', response)),
                   map(response =>  voyageAction.loadVoyagesByPeriodeSuccess({ 
                       voyages: response.content, 
                       totalItems: response.totalElements 
                   })),
                   catchError(error => {
                       console.error('Erreur:', error);
                       return of(voyageAction.loadVoyagesByPeriodeFailure({ error }));
                   })
               )
           )
       )
   );
   

    
}