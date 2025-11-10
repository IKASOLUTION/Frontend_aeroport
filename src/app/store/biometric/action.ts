import {props, createAction} from '@ngrx/store';
import { DonneeBiometrique, DonneeBiometriqueList } from './model';
export const createDonneeBiometrique = createAction('[App Init] Create DonneeBiometrique', props<DonneeBiometrique>());
export const updateDonneeBiometrique = createAction('[App Init] update DonneeBiometrique', props<DonneeBiometrique>());
export const deleteDonneeBiometrique = createAction('[App Init] delete DonneeBiometrique', props<DonneeBiometrique>());
export const deleteDonneeBiometriques = createAction('[App Init] delete DonneeBiometriques', props<{DonneeBiometriqueList: Array<DonneeBiometrique>}>());
export const loadDonneeBiometrique = createAction('[App Init] load DonneeBiometriques');
export const setDonneeBiometrique = createAction('[App Init] set DonneeBiometrique',  props<{donneeBiometriques: DonneeBiometrique[]}>());
