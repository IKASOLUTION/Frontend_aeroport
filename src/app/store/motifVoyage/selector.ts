
import {AppState} from '../app.state';
export const motifVoyageList = (state: AppState) => state.motifVoyageState?.motifVoyages || [];
