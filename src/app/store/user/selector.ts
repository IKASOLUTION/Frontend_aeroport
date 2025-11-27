
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {AppState} from '../app.state';
import { UserState } from './state';
export const selectUserState = createFeatureSelector<UserState>('users');


export const userList = createSelector(
  selectUserState,
  (state: UserState) => state.users
);
export const usersCountThisMonth = createSelector(
  selectUserState,
  (state: UserState) => state.countUsersCreatedThisMonth
);

