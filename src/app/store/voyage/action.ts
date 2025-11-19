import {props, createAction} from '@ngrx/store';
import {Voyage } from './model';





export const getVoyage = createAction(
    '[Aeroport] Update Voyage', 
    props<Voyage>()
);

export const loadVoyage = createAction('[Aeroport] Load Voyage');

export const setVoyage= createAction(
    '[Aeroport] Set Voyage',  
    props<{voyages: Voyage[]}>()
);