import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import {VilleState } from './state';

const initialState: VilleState = {
  villes: [], 
};

const featureReducer = createReducer<VilleState>(
  initialState,
  on(featureActions.setVille, (state, { villes }): VilleState => {
    return {
      ...state,
      villes: villes
    };
  }),
);

export function VilleReducer(state: VilleState | undefined, action: Action): VilleState {
  return featureReducer(state, action);
}