
// ==================== vol.reducer.ts ====================
import { Action, createReducer, on } from '@ngrx/store';
import * as voyageAction from './action';
import { initialVoyageState } from './state';

export const VoyageReducer = createReducer(
    initialVoyageState,

    // Load all vols
    on(voyageAction.loadVoyage, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(voyageAction.loadVoyageSuccess, (state, { voyages }) => ({
        ...state,
        voyages,
        loading: false,
        error: null
    })),

    on(voyageAction.loadVoyageFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors du chargement des vols'
    })),

    // Load vols by periode
    on(voyageAction.loadVoyagesByPeriode, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(voyageAction.loadVoyagesByPeriodeSuccess, (state, { voyages, totalItems }) => ({
        ...state,
        voyages,
        totalItems,
        loading: false,
        error: null
    })),

    on(voyageAction.loadVoyagesByPeriodeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error.message || 'Erreur lors du chargement des vols par période'
})),

    // Create vol
    
);
