
import {AppState} from '../app.state';
export const compagnieList = (state: AppState) => state.compagnieState?.compagnies || [];
