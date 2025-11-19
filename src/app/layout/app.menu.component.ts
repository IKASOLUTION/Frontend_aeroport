import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AppMenuitemComponent } from './app.menuitem.component';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    standalone: true,
    imports: [NgFor, NgIf, AppMenuitemComponent]
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
<<<<<<< HEAD
        this.model = [
            {
                items: [
                    {
                        label: 'Tableau de Bord',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin/dashboard']
                    }
                ]
            },



            {
                label: 'Administration',
                icon: 'fa-solid fa-users',
                items: [
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/admin/user']
                    },
                    {
                        label: 'Gestion des modules',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/admin/module-param']
                    },


                ]
            },
            {
                label: 'Passagers',
                icon: 'pi  pi-fw pi-plane',
                items: [
                    {
                        label: 'Enregistrement',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/admin/gestion-enregistrements']
                    },
                    {
                        label: 'Registre des Passagers',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/admin/registre-passagers']
                    },
                    {
                        label: 'Voyageur attente',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/admin/voyageur-attente']
                    },

                    {
                        label: 'Gestion des Voyages',
                        icon: 'pi pi-fw pi-share-alt',
                        routerLink: ['/admin/gestion-voyages']
                    },
                    {
                        label: 'Motifs de Voyage',
                        icon: 'pi pi-building',
                        routerLink: ['/admin/motifVoyage']
                    },

                ]

            },




            {
                label: 'Infrastructure',
                icon: 'pi pi-fw pi-user',
                items: [
                    //    {
                    //         label: 'Gestion des Pays',
                    //         icon: 'pi pi-building',
                    //         routerLink: ['/admin/pays']
                    //     },
                    {
                        label: 'Gestion des Villes',
                        icon: 'pi pi-building',
                        routerLink: ['/admin/ville']
                    },

                    {
                        label: 'Gestion des Aeroports',
                        icon: 'pi pi-building',
                        routerLink: ['/admin/aeroport']
                    },

                    {
                        label: 'Gestion des Compagnies',
                        icon: 'pi pi-building',
                        routerLink: ['/admin/compagnie']
                    },

                    {
                        label: 'Gestion des Vols',
                        icon: 'pi pi-send',
                        routerLink: ['/admin/vol']

                    },


                ]
            },


            {
                label: 'Sécurité',
                icon: 'pi pi-fw pi-user',
                items: [


                    {
                        label: 'Gestion de la liste Noire',
                        icon: 'pi pi-building',
                        routerLink: ['/admin/listeNoire']
                    },



                ]
            },


        ];

    }
    /*  this.model = [
         {
             items: [
                 {
                     label: 'Tableau de Bord',
                     icon: 'fa-solid fa-chart-pie',
                     routerLink: ['/admin/dashboard']
                 }
             ]
         },
         {
             label: 'Gestion des Accès',
             icon: 'fa-solid fa-users',
             items: [
                 {
                     label: 'Gestion des Rôles',
                     icon: 'fa-solid fa-user-shield',
                     routerLink: ['/admin/roles']
                 },
                 {
                     label: 'Gestion des modules',
                     icon: 'fa-solid fa-user-shield',
                     routerLink: ['/admin/module-param']
                 },
                 {
                     label: 'Gestion des Utilisateurs',
                     icon: 'fa-solid fa-users',
                     routerLink: ['/admin/user']
                 }
             ]
         },
         {
             label: 'Infrastructure',
             icon: 'fa-solid fa-building',
             items: [
                 {
                     label: 'Gestion des Aéroports',
                     icon: 'fa-solid fa-plane-departure',
                     routerLink: ['/admin/aeroport']
                 },
                 {
                     label: 'Gestion des Compagnies',
                     icon: 'fa-solid fa-building',
                     routerLink: ['/admin/compagnie']
                 },
                 {
                     label: 'Gestion des Villes',
                     icon: 'fa-solid fa-city',
                     routerLink: ['/admin/ville']
                 },
                 {
                     label: 'Gestion des Vols',
                     icon: 'fa-solid fa-plane',
                     routerLink: ['/admin/vol']
                 }
             ]
         },   
         {
             label: 'Passagers',
             icon: 'fa-solid fa-users',
             items: [
                 {
                     label: 'Effectuer un Enregistrement',
                     icon: 'fa-solid fa-clipboard-check',
                     routerLink: ['/admin/gestion-enregistrements']
                 },
                 {
                     label: 'Registre des Passagers',
                     icon: 'fa-solid fa-address-book',
                     routerLink: ['/admin/registre-passagers']
                 },
                 {
                     label: 'Voyageurs en Attente',
                     icon: 'fa-solid fa-user-clock',
                     routerLink: ['/admin/voyageurs-attente']
                 },
                 {
                     label: 'Gestion des Voyages',
                     icon: 'fa-solid fa-route',
                     routerLink: ['/admin/gestion-voyages']
                 },
                 {
                     label: 'Motifs de Voyages',
                     icon: 'fa-solid fa-clipboard-list',
                     routerLink: ['/admin/motifVoyage']
                 }
             ]
         },
         {
             label: 'Sécurité',
             icon: 'fa-solid fa-shield-halved',
             items: [
                 {
                     label: 'Gestion de la Liste Noire',
                     icon: 'fa-solid fa-user-slash',
                     routerLink: ['/admin/listeNoire']
                 },
                 {
                     label: 'Données Biométriques',
                     icon: 'fa-solid fa-fingerprint',
                     routerLink: ['/admin/donnees-biometriques']
                 },
                 {
                     label: 'Notification Urgente',
                     icon: 'fa-solid fa-bell',
                     routerLink: ['/admin/notification']
                 }
             ]
         },
         {
             label: 'Système',
             icon: 'fa-solid fa-gear',
             items: [
                 {
                     label: 'Historique des Actions',
                     icon: 'fa-solid fa-history',
                     routerLink: ['/admin/historique-actions']
                 },
                 {
                     label: 'Connexion SDK',
                     icon: 'fa-solid fa-satellite-dish',
                     routerLink: ['/admin/connexion-sdk']
                 }
             ]
         }
     ]; 
 } */
    
}
