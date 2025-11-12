import { createReducer, on, Action } from '@ngrx/store';
import {MotifVoyageState } from './state';
import * as featureActions from './action';


const initialState: MotifVoyageState = {
  motifVoyages: [], 
};

const featureReducer = createReducer<MotifVoyageState>(
  initialState,
  on(featureActions.setMotifVoyage, (state, { motifVoyages }): MotifVoyageState => {
    return {
      ...state,
      motifVoyages: motifVoyages
    };
  }),
);

export function MotifVoyageReducer(state: MotifVoyageState | undefined, action: Action): MotifVoyageState {
  return featureReducer(state, action);
}