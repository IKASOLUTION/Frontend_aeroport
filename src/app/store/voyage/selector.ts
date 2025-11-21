import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VoyageState } from './state';

// Sélecteur de l'état des vols
export const selectVoyageState = createFeatureSelector<VoyageState>('voyageState');

// Sélecteur pour la liste des vols
export const voyageList = createSelector(
    selectVoyageState,
    (state: VoyageState) => state.voyages
);

// Sélecteur pour le total d'items (pagination)
export const voyageTotalItems = createSelector(
    selectVoyageState,
    (state: VoyageState) => state?.totalItems
);

// Sélecteur pour l'état de chargement
export const voyageLoading = createSelector(
    selectVoyageState,
    (state: VoyageState) => state?.loading
);

// Sélecteur pour les erreurs
export const voyageError = createSelector(
    selectVoyageState,
    (state: VoyageState) => state?.error
);

// Sélecteur pour le vol sélectionné
export const selectedVoyage = createSelector(
    selectVoyageState,
    (state: VoyageState) => state?.selectedVoyage
);