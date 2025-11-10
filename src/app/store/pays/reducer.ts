import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { PaysState } from './state';

const initialState: PaysState = {
  payss: [], 
};

const featureReducer = createReducer<PaysState>(
  initialState,
  on(featureActions.setPays, (state, { payss }): PaysState => {
    return {
      ...state,
      payss: payss
    };
  }),
);

export function PaysReducer(state: PaysState | undefined, action: Action): PaysState {
  return featureReducer(state, action);
}