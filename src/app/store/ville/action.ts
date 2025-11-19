import {props, createAction} from '@ngrx/store';
import { Ville } from './model';




export const createVille = createAction('[App Init] Create Ville', props<Ville>());
export const updateVille = createAction(
    '[Ville] Update Ville', 
    props<{ ville: Ville }>()
);export const deleteVille = createAction('[App Init] delete Ville', props<Ville>());
export const loadVille = createAction('[App Init] load Ville');
export const setVille = createAction('[App Init] set Ville',  props<{villes: Ville[]}>());
