import { User } from "./model";
export interface UserState {
    users: Array<User>;
      countUsersCreatedThisMonth: number;
       loading?: boolean;
   

}