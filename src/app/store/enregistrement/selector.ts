
import {AppState} from '../app.state';
export const enregistrementList = (state: AppState) => state.enregistrementState.enregistrements;
export const selectedEnregistrement =  (state: AppState) => state.enregistrementState.enregistrement;
