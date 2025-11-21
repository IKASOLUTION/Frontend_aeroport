import {props, createAction} from '@ngrx/store';
import {Voyage } from './model';
import { SearchDto } from '../vol/model';


// Action pour charger tous les vols
export const loadVoyage = createAction('[Voyage] Load Voyage');

export const loadVoyageSuccess = createAction(
    '[Vol] Load Voyage Success',
    props<{ voyages: Voyage[] }>()
);

export const loadVoyageFailure = createAction(
    '[Vol] Load Voyage Failure',
    props<{ error: any }>()
);

// Action pour charger les vols par période et statuts
export const loadVoyagesByPeriode = createAction(
    '[Vol] Load Voyages By Periode',
    props<{ searchDto: SearchDto }>()
);

export const loadVoyagesByPeriodeSuccess = createAction(
    '[Vol] Load Voyages By Periode Success',
    props<{ voyages: Voyage[], totalItems: number }>()
);

export const loadVoyagesByPeriodeFailure = createAction(
    '[Vol] Load Voyages By Periode Failure',
    props<{ error: any }>()
);

