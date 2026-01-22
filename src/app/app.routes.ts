import { Routes } from '@angular/router';
import { UserRouteAccessService } from './service-util/auth/user-route-access-service';

export const routes: Routes = [

  {
    path: 'site-aeroport',
   
    children: [
      {
        path: 'accueil', loadComponent: () => import('./demo/components/landing/landing.component').then(m => m.LandingComponent)
      },

      {
        path: 'auth', loadComponent: () => import('./modules/site/auth/auth.component').then(m => m.AuthComponent)
      },
       {
        path: 'preEnregistrement', loadComponent: () => import('./modules/site/PreEnregistrement/preEnregistrement.component').then(m => m.PreEnregistrementComponent)
      },
      {
        path: 'mesPreEnregistrement', loadComponent: () => import('./modules/site/MesPreEnregistrement/mesPreEnregistrement.component').then(m => m.MesPreEnregistrementComponent)
      },
    ]
  },



  {
    path: 'not-found', loadComponent: () => import('./demo/components/notfound/notfound.component').then(m => m.NotfoundComponent)
  },



 // { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
 { path: '', redirectTo: '/site-aeroport/accueil', pathMatch: 'full' },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/app.layout.component').then(
        (module) => module.AppLayoutComponent
      ),
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // { path: 'dashboard', data: { breadcrumb: 'Accueil' }, title: 'Dashboard', loadComponent: () => import('./modules/home/home.component').then(c => c.HomeComponent) },
      { path: 'dashboard', data: { breadcrumb: 'Acceuil', authorities: ['ADMIN'] }, loadChildren: () => import('./demo/components/dashboards/dashboards.module').then(m => m.DashboardsModule), canActivate: [UserRouteAccessService] },
      // { path: 'pages', data: { breadcrumb: 'Pages' }, loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
     { path: 'login', title: 'Login', loadComponent: () => import('./modules/login/login.component').then(c => c.LoginComponent) },
{ path: 'module-param', data: { breadcrumb: 'Gestion des modules', authorities: ['MODULE'] }, loadComponent: () => import('./modules/securite/module-param/module-param.component').then(m => m.ModuleParamComponent), canActivate: [UserRouteAccessService] },
{ path: 'user', data: { breadcrumb: 'Utilisateurs', authorities: ['UTILISATEUR'] }, loadComponent: () => import('./modules/securite/user/user.component').then(m => m.UserComponent), canActivate: [UserRouteAccessService] },
{ path: 'pays', data: { breadcrumb: 'Pays', authorities: ['LOCALITE'] }, loadComponent: () => import('./modules/pays/pays.component').then(m => m.PaysComponent), canActivate: [UserRouteAccessService] },
{ path: 'ville', data: { breadcrumb: 'Ville', authorities: ['LOCALITE'] }, loadComponent: () => import('./modules/ville/ville.component').then(m => m.VilleComponent), canActivate: [UserRouteAccessService] },
{ path: 'aeroport', data: { breadcrumb: 'Aeroport', authorities: ['AEROPORT'] }, loadComponent: () => import('./modules/aeroport/aeroport.component').then(m => m.AeroportComponent), canActivate: [UserRouteAccessService] },
{ path: 'compagnie', data: { breadcrumb: 'Compagnie', authorities: ['COMPAGNIE'] }, loadComponent: () => import('./modules/compagnie/compagnie.component').then(m => m.CompagnieComponent), canActivate: [UserRouteAccessService] },
{ path: 'listeNoire', data: { breadcrumb: 'Liste Noire', authorities: ['LISTE_NOIRE'] }, loadComponent: () => import('./modules/listeNoire/listeNoire.component').then(m => m.ListeNoireComponent), canActivate: [UserRouteAccessService] },
{ path: 'motifVoyage', data: { breadcrumb: 'Motif de Voyage', authorities: ['MOTIF'] }, loadComponent: () => import('./modules/motifVoyage/motifVoyage.component').then(m => m.MotifVoyageComponent), canActivate: [UserRouteAccessService] },
{ path: 'gestion-enregistrements', data: { breadcrumb: 'Gestion des Enregistrements', authorities: ['ENREGISTREMENT'] }, loadComponent: () => import('./modules/enregistrement/enregistrement.component').then(m => m.EnregistrementComponent), canActivate: [UserRouteAccessService] },
{ path: 'vol', data: { breadcrumb: 'Vol', authorities: ['VOL'] }, loadComponent: () => import('./modules/vol/vol.component').then(m => m.VolComponent), canActivate: [UserRouteAccessService] },
{ path: 'registre-passagers', data: { breadcrumb: 'Registre des Passagers', authorities: ['REGISTRE'] }, loadComponent: () => import('./modules/register/register.component').then(m => m.RegisterComponent), canActivate: [UserRouteAccessService] },
{ path: 'voyageur-attente', data: { breadcrumb: 'Voyageur attente', authorities: ['VOYAGEUR_ATTENTE'] }, loadComponent: () => import('./modules/voyageur-attente/voyageur-attente.component').then(m => m.VoyageurAttenteComponent), canActivate: [UserRouteAccessService] },
{ path: 'donnee-biometrique', data: { breadcrumb: 'Données biométriques', authorities: ['DONNEE_BIOMETRIQUE'] }, loadComponent: () => import('./modules/donnee-biometrique/donnee-biometrique.component').then(m => m.DonneeBiometriqueComponent), canActivate: [UserRouteAccessService] },
{ path: 'notification', data: { breadcrumb: 'Notification Urgente', authorities: ['NOTIFICATION'] }, loadComponent: () => import('./modules/notification/notification.component').then(m => m.NotificationComponent), canActivate: [UserRouteAccessService] },
{ path: 'voyage', data: { breadcrumb: 'Gestion des Voyages', authorities: ['VOYAGE'] }, loadComponent: () => import('./modules/voyage/voyage.component').then(m => m.VoyageComponent), canActivate: [UserRouteAccessService] },








    ]
  },
  {
    path: '**',
    title: 'Page non trouvé',
    loadComponent: () =>
      import('./demo/components/notfound/notfound.component').then(
        (module) => module.NotfoundComponent
      ),
  },
]
