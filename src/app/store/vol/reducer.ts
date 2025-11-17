
// ==================== vol.reducer.ts ====================
import { Action, createReducer, on } from '@ngrx/store';
import * as volActions from './action';
import { initialVolState, VolState } from './state';

export const VolReducer = createReducer(
    initialVolState,

    // Load all vols
    on(volActions.loadVol, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.loadVolSuccess, (state, { vols }) => ({
        ...state,
        vols,
        loading: false,
        error: null
    })),

    on(volActions.loadVolFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors du chargement des vols'
    })),

    // Load vols by periode
    on(volActions.loadVolsByPeriode, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.loadVolsByPeriodeSuccess, (state, { vols, totalItems }) => ({
        ...state,
        vols,
        totalItems,
        loading: false,
        error: null
    })),

    on(volActions.loadVolsByPeriodeFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors du chargement des vols par période'
    })),

    // Create vol
    on(volActions.createVol, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.createVolSuccess, (state, { vol }) => ({
        ...state,
        vols: [...state.vols, vol],
        loading: false,
        error: null
    })),

    on(volActions.createVolFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors de la création du vol'
    })),

    // Update vol
    on(volActions.updateVol, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.updateVolSuccess, (state, { vol }) => ({
        ...state,
        vols: state.vols.map(v => v.id === vol.id ? vol : v),
        loading: false,
        error: null
    })),

    on(volActions.updateVolFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors de la mise à jour du vol'
    })),

    // Delete vol
    on(volActions.deleteVol, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.deleteVolSuccess, (state, { id }) => ({
        ...state,
        vols: state.vols.filter(v => v.id !== id),
        totalItems: state.totalItems - 1,
        loading: false,
        error: null
    })),

    on(volActions.deleteVolFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors de la suppression du vol'
    })),

    // Change status vol
    on(volActions.changerStatusVol, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(volActions.changerStatusVolSuccess, (state, { vol }) => ({
        ...state,
        vols: state.vols.map(v => v.id === vol.id ? vol : v),
        loading: false,
        error: null
    })),

    on(volActions.changerStatusVolFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message || 'Erreur lors du changement de statut du vol'
    }))
);
