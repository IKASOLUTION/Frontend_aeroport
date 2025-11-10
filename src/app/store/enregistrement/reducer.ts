import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { Enregistrement } from './model';
import { EnregistrementState } from './state';

const initialState: EnregistrementState = {
  enregistrements: [],
  enregistrement: {} 
};

const featureReducer = createReducer<EnregistrementState>(
  initialState,
  on(featureActions.setEnregistrement, (state, { enregistrements }): EnregistrementState => {
    return {
      ...state,
      enregistrements: enregistrements
    };
  }),
   on(featureActions.selecteEnregistrement, (state, { enregistrement }): EnregistrementState => {
    return {
      ...state,
      enregistrement: enregistrement
    };
  }),
);

export function Enregistrementreducer(state: EnregistrementState | undefined, action: Action): EnregistrementState {
  return featureReducer(state, action);
}