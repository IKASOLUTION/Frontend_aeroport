import {props, createAction} from '@ngrx/store';
import {MotifVoyage } from './model';


// ✅ Action sans wrapper
export const createMotifVoyage = createAction(
    '[Aeroport] Create MotifVoyage', 
    props<MotifVoyage>()
);

export const updateMotifVoyage = createAction(
    '[Aeroport] Update MotifVoyage', 
    props<MotifVoyage>()
);

export const deleteMotifVoyage = createAction(
    '[Aeroport] Delete MotifVoyage', 
    props<MotifVoyage>()
);



export const loadMotifVoyage = createAction('[Aeroport] Load MotifVoyage');

export const setMotifVoyage= createAction(
    '[Aeroport] Set MotifVoyage',  
    props<{motifVoyages: MotifVoyage[]}>()
);