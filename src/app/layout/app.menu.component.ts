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
                /* {
                    label: 'Gestion des Rôles',
                    icon: 'fa-solid fa-user-shield',
                    routerLink: ['/admin/roles']
                }, */
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
                    routerLink: ['/admin/voyageur-attente']
                },
                {
                    label: 'Gestion des Voyages',
                    icon: 'fa-solid fa-route',
                    routerLink: ['/admin/voyage']
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
}
}
