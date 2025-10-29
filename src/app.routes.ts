import { Routes } from '@angular/router';
import { TableauDeBordComponent } from './composants/tableau-de-bord/tableau-de-bord.component';
import { UtilisateursComponent } from './composants/utilisateurs/utilisateurs.component';
import { VolsComponent } from './composants/vols/vols.component';
import { CompagniesComponent } from './composants/compagnies/compagnies.component';
import { AeroportsComponent } from './composants/aeroports/aeroports.component';
import { ListeNoireComponent } from './composants/liste-noire/liste-noire.component';
import { HistoriqueComponent } from './composants/historique/historique.component';
import { RolesComponent } from './composants/roles/roles.component';
import { MotifsVoyagesComponent } from './composants/motifs-voyages/motifs-voyages.component';
import { RegistrePassagersComponent } from './composants/registre-passagers/registre-passagers.component';
import { VoyageursAttenteComponent } from './composants/voyageurs-attente/voyageurs-attente.component';
import { BiometrieComponent } from './composants/biometrie/biometrie.component';
import { VoyagesComponent } from './composants/voyages/voyages.component';
import { NotificationsUrgentesComponent } from './composants/notifications-urgentes/notifications-urgentes.component';
import { ProfilComponent } from './composants/profil/profil.component';
import { ConnexionComponent } from './composants/connexion/connexion.component';
import { InscriptionComponent } from './composants/inscription/inscription.component';
import { EnregistrementsComponent } from './composants/enregistrements/enregistrements.component';
import { ConnexionSdkComponent } from './composants/connexion-sdk/connexion-sdk.component';
import { ModuleParamComponent } from './composants/module-param/module-param.component';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent, title: 'Connexion' },
  { path: 'inscription', component: InscriptionComponent, title: 'Inscription' },
  { path: 'tableau-de-bord', component: TableauDeBordComponent, title: 'Tableau de Bord' },
  
  // Gestion des Accès
  { path: 'gestion-roles', component: RolesComponent, title: 'Gestion des Rôles' },
  { path: 'module-param', component: ModuleParamComponent, title: 'Gestion des modules' },
  { path: 'gestion-utilisateurs', component: UtilisateursComponent, title: 'Gestion des Utilisateurs' },
  { path: 'profil', component: ProfilComponent, title: 'Profil Utilisateur' },
  
  // Infrastructure
  { path: 'gestion-aeroports', component: AeroportsComponent, title: 'Gestion des Aéroports' },
  { path: 'gestion-compagnies', component: CompagniesComponent, title: 'Gestion des Compagnies' },
  { path: 'gestion-vols', component: VolsComponent, title: 'Gestion des Vols' },

  // Passagers
  { path: 'gestion-enregistrements', component: EnregistrementsComponent, title: 'Gestion des Enregistrements' },
  { path: 'registre-passagers', component: RegistrePassagersComponent, title: 'Registre des Passagers' },
  { path: 'voyageurs-attente', component: VoyageursAttenteComponent, title: 'Voyageurs en Attente' },
  { path: 'gestion-voyages', component: VoyagesComponent, title: 'Gestion des Voyages' },
  { path: 'gestion-motifs-voyages', component: MotifsVoyagesComponent, title: 'Gestion des Motifs de Voyages' },

  // Sécurité
  { path: 'gestion-liste-noire', component: ListeNoireComponent, title: 'Gestion de la Liste Noire' },
  { path: 'donnees-biometriques', component: BiometrieComponent, title: 'Données Biométriques' },
  { path: 'notification-urgente', component: NotificationsUrgentesComponent, title: 'Alertes de Sécurité' },
  
  // Système
  { path: 'historique-actions', component: HistoriqueComponent, title: 'Historique des Actions' },
  { path: 'connexion-sdk', component: ConnexionSdkComponent, title: 'Connexion SDK' },
  
  { path: '**', redirectTo: 'tableau-de-bord' }
];