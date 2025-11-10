import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { AeroportState } from './state';

const initialState: AeroportState = {
  aeroports: [], 
};

const featureReducer = createReducer<AeroportState>(
  initialState,
  on(featureActions.setAeroport, (state, { aeroports }): AeroportState => {
    return {
      ...state,
      aeroports: aeroports
    };
  }),
);

export function AeroportReducer(state: AeroportState | undefined, action: Action): AeroportState {
  return featureReducer(state, action);
}