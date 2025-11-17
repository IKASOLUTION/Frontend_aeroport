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
        this.model = [
            {
                items: [
                    {
                        label: 'Dashboard',
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
}
