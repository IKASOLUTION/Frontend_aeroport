
import {AppState} from '../app.state';
export const voyageList = (state: AppState) => state.voyageState?.voyages || [];
export const getVoyageById = (state: AppState, id: number) => {
    return state.voyageState?.voyages.find(voyage => voyage.id === id) || null;
}