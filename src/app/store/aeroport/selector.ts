
import {AppState} from '../app.state';
export const aeroportList = (state: AppState) => state.aeroportState?.aeroports || [];
