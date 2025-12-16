
import {AppState} from '../app.state';
export const enregistrementList = (state: AppState) => state.enregistrementState.enregistrements;
export const selectedEnregistrement =  (state: AppState) => state.enregistrementState.enregistrement;
export const enregistrementTotalItems =(state: AppState)=> state.enregistrementState. totalItems;
export const enregistrementLoading = (state: AppState) => state.enregistrementState.loading;
export const voyageurAttentList = (state: AppState) => state.enregistrementState.voyageurAttentes;
export const preEnregistrementList = (state: AppState) => state.enregistrementState.preEnregistrements;
