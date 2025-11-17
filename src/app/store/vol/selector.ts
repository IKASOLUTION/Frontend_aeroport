import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VolState } from './state';

// Sélecteur de l'état des vols
export const selectVolState = createFeatureSelector<VolState>('volState');

// Sélecteur pour la liste des vols
export const volList = createSelector(
    selectVolState,
    (state: VolState) => state?.vols
);

// Sélecteur pour le total d'items (pagination)
export const volTotalItems = createSelector(
    selectVolState,
    (state: VolState) => state?.totalItems
);

// Sélecteur pour l'état de chargement
export const volLoading = createSelector(
    selectVolState,
    (state: VolState) => state?.loading
);

// Sélecteur pour les erreurs
export const volError = createSelector(
    selectVolState,
    (state: VolState) => state?.error
);

// Sélecteur pour le vol sélectionné
export const selectedVol = createSelector(
    selectVolState,
    (state: VolState) => state?.selectedVol
);