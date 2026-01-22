import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AppMenuitemComponent } from './app.menuitem.component';
import { NgFor, NgIf } from '@angular/common';
import { AccountService } from '../service-util/auth/account.service';

interface MenuItem {
    label?: string;
    icon?: string;
    routerLink?: string[];
    roles?: string[];
    items?: MenuItem[];
    separator?: boolean;
}

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    standalone: true,
    imports: [NgFor, NgIf, AppMenuitemComponent]
})
export class AppMenuComponent implements OnInit {

    model: MenuItem[] = [];

    constructor(private accountService: AccountService) {}

    ngOnInit(): void {
        // S'abonner aux changements d'authentification
        this.accountService.getAuthenticationState().subscribe(() => {
            this.buildMenu();
        });

        // Construire le menu initial
        this.buildMenu();
    }

    private buildMenu(): void {
        const fullMenu: MenuItem[] = [

        {
            items: [
                {
                    label: 'Tableau de Bord',
                    icon: 'fa-solid fa-chart-pie',
                    routerLink: ['/admin/dashboard'],
                    roles: ['ADMIN']
                  //  roles: ['ADMIN', 'MANAGER', 'AGENT', 'SECURITE']
                }
            ]
        },
        {
            label: 'Gestion des Accès',
            icon: 'fa-solid fa-users',
            roles: ['ACCES'],
            items: [
                
                {
                    label: 'Gestion des modules',
                    icon: 'fa-solid fa-user-shield',
                    routerLink: ['/admin/module-param'],
                    roles: ['MODULE']
                },
                {
                    label: 'Gestion des Utilisateurs',
                    icon: 'fa-solid fa-users',
                    routerLink: ['/admin/user'],
                    roles: ['UTILISATEUR']
                }
            ]
        },
        {
            label: 'Infrastructure',
            icon: 'fa-solid fa-building',
            roles: ['INFRASTRUCTURE'],
            items: [
                {
                    label: 'Gestion des Localités',
                    icon: 'fa-solid fa-city',
                    routerLink: ['/admin/ville'],
                    roles: ['LOCALITE']
                },
                {
                    label: 'Gestion des Aéroports',
                    icon: 'fa-solid fa-plane-departure',
                    routerLink: ['/admin/aeroport'],
                    roles: ['AEROPORT']
                },
                {
                    label: 'Gestion des Compagnies',
                    icon: 'fa-solid fa-building',
                    routerLink: ['/admin/compagnie'],
                    roles: ['COMPAGNIE']
                },
                {
                    label: 'Gestion des Vols',
                    icon: 'fa-solid fa-plane',
                    routerLink: ['/admin/vol'],
                    roles: ['VOL']
                }
            ]
        },   
        {
            label: 'Passagers',
            icon: 'fa-solid fa-users',
            roles: ['PASSAGER'],
            items: [
                {
                    label: 'Effectuer un Enregistrement',
                    icon: 'fa-solid fa-clipboard-check',
                    routerLink: ['/admin/gestion-enregistrements'],
                    roles: ['ENREGISTREMENT']
                },
                {
                    label: 'Registre des Passagers',
                    icon: 'fa-solid fa-address-book',
                    routerLink: ['/admin/registre-passagers'],
                    roles: ['REGISTRE']
                },
                {
                    label: 'Voyageurs en Attente',
                    icon: 'fa-solid fa-user-clock',
                    routerLink: ['/admin/voyageur-attente'],
                    roles: ['VOYAGEUR_ATTENTE']
                },
                {
                    label: 'Gestion des Voyages',
                    icon: 'fa-solid fa-route',
                    routerLink: ['/admin/voyage'],
                    roles: ['VOYAGE']
                },
                {
                    label: 'Motifs de Voyages',
                    icon: 'fa-solid fa-clipboard-list',
                    routerLink: ['/admin/motifVoyage'],
                    roles: ['MOTIF']
                }
            ]
        },
        {
            label: 'Sécurité',
            icon: 'fa-solid fa-shield-halved',
            roles: [ 'SECURITE'],
            items: [
                {
                    label: 'Gestion de la Liste Noire',
                    icon: 'fa-solid fa-user-slash',
                    routerLink: ['/admin/listeNoire'],
                    roles: ['LISTE_NOIRE']
                },
                {
                    label: 'Données Biométriques',
                    icon: 'fa-solid fa-fingerprint',
                    routerLink: ['/admin/donnee-biometrique'],
                    roles: ['DONNEE_BIOMETRIQUE']
                },
                {
                    label: 'Notification',
                    icon: 'fa-solid fa-bell',
                    routerLink: ['/admin/notification'],
                    roles: ['NOTIFICATION']
                }
            ]
        },
        {
            label: 'Système',
            icon: 'fa-solid fa-gear',
            roles: ['ADMIN'],
            items: [
                {
                    label: 'Historique des Actions',
                    icon: 'fa-solid fa-history',
                    routerLink: ['/admin/historique-actions'],
                    roles: ['ADMIN']
                },
                {
                    label: 'Connexion SDK',
                    icon: 'fa-solid fa-satellite-dish',
                    routerLink: ['/admin/connexion-sdk'],
                    roles: ['ADMIN']
                }
            ]
        }
    
           
            
        ];

        // Filtrer le menu en fonction des rôles de l'utilisateur
        this.model = this.filterMenuByRoles(fullMenu);
    }

    private filterMenuByRoles(menuItems: MenuItem[]): MenuItem[] {
        return menuItems
            .map(item => {
                // Créer une copie de l'item
                const filteredItem: MenuItem = { ...item };

                // Si l'item a des sous-items, les filtrer récursivement
                if (filteredItem.items && Array.isArray(filteredItem.items)) {
                    filteredItem.items = filteredItem.items.filter((subItem: MenuItem) => {
                        // Si le sous-item a des rôles requis, vérifier l'accès
                        if (subItem.roles && Array.isArray(subItem.roles)) {
                            return this.accountService.hasAnyAuthority(subItem.roles);
                        }
                        // Si pas de rôles requis, afficher l'item
                        return true;
                    });

                    // Si après filtrage il ne reste aucun sous-item, ne pas afficher le groupe
                    if (filteredItem.items.length === 0) {
                        return null;
                    }
                }

                // Vérifier les rôles du groupe parent
                if (filteredItem.roles && Array.isArray(filteredItem.roles)) {
                    if (!this.accountService.hasAnyAuthority(filteredItem.roles)) {
                        return null;
                    }
                }

                return filteredItem;
            })
            .filter((item): item is MenuItem => item !== null); // Retirer les items null
    }
}
