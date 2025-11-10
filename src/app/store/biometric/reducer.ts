import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { DonneeBiometrique } from './model';
import { DonneeBiometriqueState } from './state';

const initialState: DonneeBiometriqueState = {
  donneeBiometriques: [], 
};

const featureReducer = createReducer<DonneeBiometriqueState>(
  initialState,
  on(featureActions.setDonneeBiometrique, (state, { donneeBiometriques }): DonneeBiometriqueState => {
    return {
      ...state,
      donneeBiometriques: donneeBiometriques
    };
  }),
);

export function biometricReducer(state: DonneeBiometriqueState | undefined, action: Action): DonneeBiometriqueState {
  return featureReducer(state, action);
}