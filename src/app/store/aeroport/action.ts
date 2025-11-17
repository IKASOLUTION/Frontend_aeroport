import {props, createAction} from '@ngrx/store';
import { Aeroport } from './model';


// ✅ Action sans wrapper
export const createAeroport = createAction(
    '[Aeroport] Create Aeroport', 
    props<Aeroport>()
);

export const updateAeroport = createAction(
    '[Aeroport] Update Aeroport', 
    props<Aeroport>()
);

// export const deleteAeroport = createAction(
//     '[Aeroport] Delete Aeroport', 
//     props<Aeroport>()
// );
export const deleteAeroport = createAction('[App Init] delete Aeroport', props<Aeroport>());

export const changerStatusAeroport = createAction(
    '[Aeroport] Change Status Aeroport', 
    props<Aeroport>()
);

export const loadAeroport = createAction('[Aeroport] Load Aeroport');

export const setAeroport = createAction(
    '[Aeroport] Set Aeroport',  
    props<{aeroports: Aeroport[]}>()
);