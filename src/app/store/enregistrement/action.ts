import {props, createAction} from '@ngrx/store';
import { Enregistrement, EnregistrementList } from './model';
import { SearchDto } from '../vol/model';
export const createEnregistrement = createAction('[App Init] Create Enregistrement', props<Enregistrement>());
export const updateEnregistrement = createAction('[App Init] update Enregistrement', props<Enregistrement>());
export const deleteEnregistrementAttente = createAction('[App Init] delete Enregistrement', props<{enregistrement: Enregistrement, search: SearchDto}>());
export const deleteEnregistrements = createAction('[App Init] delete Enregistrements', props<{EnregistrementList: Array<Enregistrement>}>());
export const loadEnregistrement = createAction('[App Init] load Enregistrements');
export const setEnregistrement = createAction('[App Init] set Enregistrement',  props<{enregistrements: Enregistrement[]}>());
export const selecteEnregistrement = createAction('[App Init] seleted Enregistrement',  props<{enregistrement: Enregistrement}>());
export const loadEnregistrementsByPeriode = createAction(
    '[Enregistrement] Load Enregistrements By Periode',
    props<{ searchDto: SearchDto }>()
);

export const loadEnregistrementsByPeriodeSuccess = createAction(
    '[Enregistrement] Load Enregistrements By Periode Success',
    props<{ enregistrements: Enregistrement[], totalItems: number }>()
);
export const loadVoyageurAttenteByPeriodeSuccess = createAction(
    '[Enregistrement] Load Voyageur Attentes By Periode Success',
    props<{ voyageurAttentes: Enregistrement[], totalItems: number }>()
);
export const loadVoyageurAttenteByPeriode = createAction(
    '[Enregistrement] Load voyageur attente By Periode',
    props<{ searchDto: SearchDto }>()
);

export const listeVols = createAction(
    '[Enregistrement] Load voyageur  By numeroDocument',
    props<{ numeroDocument: String }>()
);

export const listeVolsSuccess = createAction(
    '[Enregistrement] Load voyageur attente Success',
    props<{ enregistrements: Enregistrement[] }>()
);

// Failure action
export const listeVolsFailure = createAction(
    '[Enregistrement] Load voyageur attente Failure',
    props<{ error: string }>()
);








