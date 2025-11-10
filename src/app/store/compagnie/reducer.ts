import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { CompagnieState } from './state';

const initialState: CompagnieState = {
  compagnies: [], 
};

const featureReducer = createReducer<CompagnieState>(
  initialState,
  on(featureActions.setCompagnie, (state, { compagnies }): CompagnieState => {
    return {
      ...state,
      compagnies: compagnies
    };
  }),
);

export function CompagnieReducer(state: CompagnieState | undefined, action: Action): CompagnieState {
  return featureReducer(state, action);
}