import { GlobalState } from "./global-config/state";
import { MenuActionState } from "./menu/state";
import { ModuleParamState } from "./module-param/state";
import { ProfilState } from "./profil/state";
import { UserState } from "./user/state";

import { EnregistrementState } from "./enregistrement/state";
import { DonneeBiometriqueState } from "./biometric/state";
import { DashboardState } from "./dashboard/state";
import { PaysState } from "./pays/state";
import { VilleState } from "./ville/state";
import { AeroportState } from "./aeroport/state";
import { CompagnieState } from "./compagnie/state";
import { VolState } from "./vol/state";
import { ListeNoireState } from "./listeNoir/state";
import { M } from "@fullcalendar/core/internal-common";
import { MotifVoyageState } from "./motifVoyage/state";
import { NotificationState } from "./notification/state";
import { VoyageState } from "./voyage/state";



export interface AppState {
  courierState: any;
  profilState: ProfilState;
  globalState: GlobalState;
  userState: UserState;
  menuActionState: MenuActionState;
  moduleParamState: ModuleParamState;
  enregistrementState: EnregistrementState;
  donneeBiometriqueState: DonneeBiometriqueState;
  dashboardState: DashboardState;
  paysState: PaysState;
  villeState: VilleState;
  aeroportState: AeroportState;
  compagnieState: CompagnieState;
  volState: VolState;
  listeNoireState: ListeNoireState;
  motifVoyageState: MotifVoyageState;
  notificationState: NotificationState;
  voyageState: VoyageState;


}
