
import {AppState} from '../app.state';
export const notificationList = (state: AppState) => state.notificationState?.notifications || [];
