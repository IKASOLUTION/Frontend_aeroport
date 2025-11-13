import { createAction, props } from '@ngrx/store';
import { Vol, SearchDto } from './model';

// Action pour charger tous les vols
export const loadVol = createAction('[Vol] Load Vol');

export const loadVolSuccess = createAction(
    '[Vol] Load Vol Success',
    props<{ vols: Vol[] }>()
);

export const loadVolFailure = createAction(
    '[Vol] Load Vol Failure',
    props<{ error: any }>()
);

// Action pour charger les vols par période et statuts
export const loadVolsByPeriode = createAction(
    '[Vol] Load Vols By Periode',
    props<{ searchDto: SearchDto }>()
);

export const loadVolsByPeriodeSuccess = createAction(
    '[Vol] Load Vols By Periode Success',
    props<{ vols: Vol[], totalItems: number }>()
);

export const loadVolsByPeriodeFailure = createAction(
    '[Vol] Load Vols By Periode Failure',
    props<{ error: any }>()
);

// Action pour créer un vol
export const createVol = createAction(
    '[Vol] Create Vol',
    props<{ vol: Vol }>()
);

export const createVolSuccess = createAction(
    '[Vol] Create Vol Success',
    props<{ vol: Vol }>()
);

export const createVolFailure = createAction(
    '[Vol] Create Vol Failure',
    props<{ error: any }>()
);

// Action pour mettre à jour un vol
export const updateVol = createAction(
    '[Vol] Update Vol',
    props<{ vol: Vol }>()
);

export const updateVolSuccess = createAction(
    '[Vol] Update Vol Success',
    props<{ vol: Vol }>()
);

export const updateVolFailure = createAction(
    '[Vol] Update Vol Failure',
    props<{ error: any }>()
);

// Action pour supprimer un vol
export const deleteVol = createAction(
    '[Vol] Delete Vol',
    props<{ vol: Vol }>()
);

export const deleteVolSuccess = createAction(
    '[Vol] Delete Vol Success',
    props<{ id: number }>()
);

export const deleteVolFailure = createAction(
    '[Vol] Delete Vol Failure',
    props<{ error: any }>()
);

// Action pour changer le statut d'un vol
export const changerStatusVol = createAction(
    '[Vol] Changer Status Vol',
    props<{ vol: Vol }>()
);

export const changerStatusVolSuccess = createAction(
    '[Vol] Changer Status Vol Success',
    props<{ vol: Vol }>()
);

export const changerStatusVolFailure = createAction(
    '[Vol] Changer Status Vol Failure',
    props<{ error: any }>()
);