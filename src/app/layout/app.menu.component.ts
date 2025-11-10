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
                icon: 'pi pi-fw pi-user',
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
                ]

            },
        ];
    }
}
