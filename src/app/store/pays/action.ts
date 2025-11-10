import {props, createAction} from '@ngrx/store';
import { Pays } from './model';




export const createPays = createAction('[App Init] Create Pays', props<Pays>());
export const updatePays = createAction('[App Init] update Pays', props<Pays>());
export const deletePays = createAction('[App Init] delete Pays', props<Pays>());
export const deletePayss = createAction('[App Init] delete Payss', props<{PaysList: Array<Pays>}>());
export const loadPays = createAction('[App Init] load Payss');
export const setPays = createAction('[App Init] set Pays',  props<{payss: Pays[]}>());