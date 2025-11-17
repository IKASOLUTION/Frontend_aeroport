import { Routes } from '@angular/router';

export const routes: Routes = [
    {
     path: 'accueil', loadComponent: () => import('./demo/components/landing/landing.component').then(m => m.LandingComponent)
    },

    {
        path: 'not-found', loadComponent: () => import('./demo/components/notfound/notfound.component').then(m => m.NotfoundComponent)
    },

    

    { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
    {
        path: 'admin',
        loadComponent: () =>
            import('./layout/app.layout.component').then(
              (module) => module.AppLayoutComponent
            ),
        children : [
            // { path: 'dashboard', data: { breadcrumb: 'Accueil' }, title: 'Dashboard', loadComponent: () => import('./modules/home/home.component').then(c => c.HomeComponent) },
            { path: 'dashboard', data: { breadcrumb: 'Acceuil'}, loadChildren: () => import('./demo/components/dashboards/dashboards.module').then(m => m.DashboardsModule) },
            { path: 'pages', data: { breadcrumb: 'Pages' }, loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
            { path: 'login', title:'Login', loadComponent: () => import('./modules/login/login.component').then(c => c.LoginComponent) },
            { path: 'module-param', data: { breadcrumb: 'Gestion des modules' }, loadComponent: () => import('./modules/securite/module-param/module-param.component').then(m => m.ModuleParamComponent) },
            { path: 'user', data: { breadcrumb: 'Utilisateurs'}, loadComponent: () => import('./modules/securite/user/user.component').then(m => m.UserComponent) },
            { path: 'pays', data: { breadcrumb: 'Pays'}, loadComponent: () => import('./modules/pays/pays.component').then(m => m.PaysComponent) },
            { path: 'ville', data: { breadcrumb: 'Ville'}, loadComponent: () => import('./modules/ville/ville.component').then(m => m.VilleComponent) },
            { path: 'aeroport', data: { breadcrumb: 'Aeroport'}, loadComponent: () => import('./modules/aeroport/aeroport.component').then(m => m.AeroportComponent) },
            { path: 'compagnie', data: { breadcrumb: 'Compagnie'}, loadComponent: () => import('./modules/compagnie/compagnie.component').then(m => m.CompagnieComponent) },
            { path: 'listeNoire', data: { breadcrumb: 'Liste Noire'}, loadComponent: () => import('./modules/listeNoire/listeNoire.component').then(m => m.ListeNoireComponent) },
            {path: 'motifVoyage', data: { breadcrumb: 'Motif de Voyage'}, loadComponent: () => import('./modules/motifVoyage/motifVoyage.component').then(m => m.MotifVoyageComponent) },
            {path: 'registre-passagers', data: { breadcrumb: 'Registre des Passagers'}, loadComponent: () => import('./modules/register/register.component').then(m => m.RegisterComponent) },

            





            

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
