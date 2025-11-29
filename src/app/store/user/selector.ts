
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './state';
export const selectUserState = createFeatureSelector<UserState>('userState');


export const userList = createSelector(
  selectUserState,
  (state: UserState) => state.users
);
export const usersCountThisMonth = createSelector(
  selectUserState,
  (state: UserState) => state.countUsersCreatedThisMonth
);

