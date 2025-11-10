import { GlobalState } from "./global-config/state";
import { MenuActionState } from "./menu/state";
import { ModuleParamState } from "./module-param/state";
import { ProfilState } from "./profil/state";
import { UserState } from "./user/state";

import { EnregistrementState } from "./enregistrement/state";
import { DonneeBiometriqueState } from "./biometric/state";



export interface AppState {
  courierState: any;
  profilState: ProfilState;
  globalState: GlobalState;
  userState: UserState;
  menuActionState: MenuActionState;
  moduleParamState: ModuleParamState;
  enregistrementState: EnregistrementState;
  donneeBiometriqueState: DonneeBiometriqueState;

}
