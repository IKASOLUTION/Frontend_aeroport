import { createReducer, on, Action } from '@ngrx/store';
import {VoyageState } from './state';
import * as featureActions from './action';

const initialState: VoyageState = {
  voyages: [], 
};

const featureReducer = createReducer<VoyageState>(
  initialState,
  on(featureActions.setVoyage, (state, { voyages }): VoyageState => {
    return {
      ...state,
      voyages: voyages
    };
  }),
);


export function VoyageReducer(state: VoyageState | undefined, action: Action): VoyageState {
  return featureReducer(state, action);
}