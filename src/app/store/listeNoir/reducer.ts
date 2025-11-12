import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { ListeNoireState } from './state';

const initialState: ListeNoireState = {
  listeNoires: [], 
};

const featureReducer = createReducer<ListeNoireState>(
  initialState,
  on(featureActions.setListeNoire, (state, { listeNoires }): ListeNoireState => {
    return {
      ...state,
      listeNoires: listeNoires
    };
  }),
);

export function ListeNoireReducer(state: ListeNoireState | undefined, action: Action): ListeNoireState {
  return featureReducer(state, action);
}