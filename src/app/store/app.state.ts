import { GlobalState } from "./global-config/state";
import { MenuActionState } from "./menu/state";
import { ModuleParamState } from "./module-param/state";
import { ProfilState } from "./profil/state";
import { UserState } from "./user/state";

import { DashboardState } from "./dashboard/state";
import { PaysState } from "./pays/state";
import { VilleState } from "./ville/state";
import { AeroportState } from "./aeroport/state";
import { CompagnieState } from "./compagnie/state";



export interface AppState {
  courierState: any;
  profilState: ProfilState;
  globalState: GlobalState;
  userState: UserState;
  menuActionState: MenuActionState;
  moduleParamState: ModuleParamState;
  dashboardState: DashboardState;
  paysState: PaysState;
  villeState: VilleState;
  aeroportState: AeroportState;
  compagnieState: CompagnieState;

}
