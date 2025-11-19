import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { Enregistrement } from './model';
import { EnregistrementState } from './state';

const initialState: EnregistrementState = {
  enregistrements: [],
  voyageurAttentes: [],
  enregistrement: {},
  totalItems: 0,
  loading: false,
  error: null
};

const featureReducer = createReducer<EnregistrementState>(
  initialState,
  
  // Charger les enregistrements - Début
  on(featureActions.loadEnregistrement, (state): EnregistrementState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  
  // Définir la liste des enregistrements
  on(featureActions.setEnregistrement, (state, { enregistrements }): EnregistrementState => {
    return {
      ...state,
      enregistrements: enregistrements,
      totalItems: enregistrements.length,
      loading: false,
      error: null
    };
  }),
  
  // Sélectionner un enregistrement
  on(featureActions.selecteEnregistrement, (state, { enregistrement }): EnregistrementState => {
    return {
      ...state,
      enregistrement: enregistrement
    };
  }),
  
  // Créer un enregistrement - Début
  on(featureActions.createEnregistrement, (state): EnregistrementState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  
  // Mettre à jour un enregistrement - Début
  on(featureActions.updateEnregistrement, (state): EnregistrementState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  
  // Supprimer un enregistrement - Début
  on(featureActions.deleteEnregistrementAttente, (state): EnregistrementState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  
  // Supprimer plusieurs enregistrements - Début
  on(featureActions.deleteEnregistrements, (state): EnregistrementState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(featureActions.loadEnregistrementsByPeriodeSuccess, (state, { enregistrements, totalItems }) => ({
          ...state,
          enregistrements,
          totalItems,
          loading: false,
          error: null
      })),

      on(featureActions.loadVoyageurAttenteByPeriodeSuccess, (state, { voyageurAttentes, totalItems }) => ({
          ...state,
          voyageurAttentes,
          totalItems,
          loading: false,
          error: null
      })),
);

export function Enregistrementreducer(state: EnregistrementState | undefined, action: Action): EnregistrementState {
  return featureReducer(state, action);
}