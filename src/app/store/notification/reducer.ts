import { createReducer, on, Action } from '@ngrx/store';
import {NotificationState } from './state';
import * as featureActions from './action';



const initialState: NotificationState = {
  notifications: [], 
};

const featureReducer = createReducer<NotificationState>(
  initialState,
  on(featureActions.setNotification, (state, { notifications }): NotificationState => {
    return {
      ...state,
      notifications: notifications
    };
  }),
);

export function NotificationReducer(state: NotificationState | undefined, action: Action): NotificationState {
  return featureReducer(state, action);
}