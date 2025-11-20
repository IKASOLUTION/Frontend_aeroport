import {props, createAction} from '@ngrx/store';
import { DonneeBiometrique } from './model';
import { SearchDto } from '../vol/model';
export const createDonneeBiometrique = createAction('[App Init] Create Donnee Biometrique', props<DonneeBiometrique>());
export const updateDonneeBiometrique = createAction('[App Init] update DonneeBiometrique', props<DonneeBiometrique>());
export const deleteDonneeBiometrique = createAction('[App Init] delete DonneeBiometrique', props<DonneeBiometrique>());
export const deleteDonneeBiometriques = createAction('[App Init] delete DonneeBiometriques', props<{DonneeBiometriqueList: Array<DonneeBiometrique>}>());
export const loadDonneeBiometrique = createAction('[App Init] load DonneeBiometriques');
export const setDonneeBiometrique = createAction('[App Init] set DonneeBiometrique',  props<{donneeBiometriques: DonneeBiometrique[]}>());
export const loadDonneeBiometriques = createAction('[App Init] load Donnees Biometriques by periode', props<{search: SearchDto}>());
export const loadEnregistrementsByPeriodeSuccess = createAction(
    '[Enregistrement] Load Donnees Biometriques By Periode Success',
    props<{ donneeBiometriques: DonneeBiometrique[], totalItems: number }>()
);

