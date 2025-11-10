import {props, createAction} from '@ngrx/store';
import { Compagnie } from './model';


export const createCompagnie = createAction('[App Init] Create Compagnie', props<Compagnie>());
export const updateCompagnie = createAction('[App Init] update Compagnie', props<Compagnie>());
export const deleteCompagnie = createAction('[App Init] delete Compagnie', props<Compagnie>());
export const loadCompagnie = createAction('[App Init] load Compagnie');
export const setCompagnie = createAction('[App Init] set Compagnie',  props<{compagnies: Compagnie[]}>());
export const changerStatusCompagnie= createAction('[App Init] changer status  Compagnie', props<Compagnie>());

