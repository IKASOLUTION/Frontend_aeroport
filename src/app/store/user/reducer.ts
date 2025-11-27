import { createReducer, on, Action } from '@ngrx/store';
import * as featureActions from './action';
import { User } from './model';
import { UserState } from './state';

const initialState: UserState = {
  users: [], 
   countUsersCreatedThisMonth: 0
};

const featureReducer = createReducer<UserState>(
  initialState,
  on(featureActions.setUser, (state, { users }): UserState => {
    return {
      ...state,
      users: users
    };
  }),
  
  on(featureActions.setUsersCountThisMonth, (state, { count }): UserState => {
    return {
      ...state,
      countUsersCreatedThisMonth: count
    };
  })
);



export function UserReducer(state: UserState | undefined, action: Action): UserState {
  return featureReducer(state, action);
}