import {props, createAction} from '@ngrx/store';
import {Notification } from './model';
import { SearchDto } from '../vol/model';


// ✅ Action sans wrapper
export const createNotification = createAction(
    '[Aeroport] Create Notification', 
    props<Notification>()
);

export const updateNotification = createAction(
    '[Aeroport] Update Notification', 
    props<Notification>()
);

export const deleteNotification = createAction(
    '[Aeroport] Delete Notification', 
    props<Notification>()
);



export const loadNotification = createAction('[Aeroport] Load Notification');

export const setNotification= createAction(
    '[Aeroport] Set Notification',  
    props<{notifications: Notification[]}>()
);

export const loadNotificationByPeriode = createAction(
    '[Aeroport] Load Notification By Periode',
    props<{ searchDto: SearchDto }>()
);