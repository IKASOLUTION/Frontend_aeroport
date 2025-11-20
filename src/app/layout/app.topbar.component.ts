import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../service-util/auth/login.service';
import { AccountService } from '../service-util/auth/account.service';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as notificationSelector from '../store/notification/selector';
import * as NotificationAction from '../store/notification/action';
import { Notification } from 'src/app/store/notification/model';
import { User } from '../store/user/model';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    standalone: true,
    imports: [RouterLink, RippleModule, StyleClassModule, CommonModule]
})
export class AppTopbarComponent implements OnInit, OnDestroy {
    
    @ViewChild('menuButton') menuButton!: ElementRef;
    @ViewChild('mobileMenuButton') mobileMenuButton!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;
    
    // Gestion des notifications
    destroy$ = new Subject<boolean>();
    notificationList$!: Observable<Array<Notification>>;
    notifications: Notification[] = [];
    notificationCount: number = 0;
    recentNotifications: any[] = []; // Pour l'affichage dans le dropdown
    loading = true;
    activeItem!: number;
    user: User | null = null;
    model: MegaMenuItem[] = [
        {
            label: 'UI KIT',
            items: [
                [
                    {
                        label: 'UI KIT 1',
                        items: [
                            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                            { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                            { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
                            { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'] },
                            { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 2',
                        items: [
                            { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                            { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                            { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 3',
                        items: [
                            { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                            { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                            { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                            { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                            { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc'] }
                        ]
                    }
                ]
            ]
        },
        {
            label: 'UTILITIES',
            items: [
                [
                    {
                        label: 'UTILITIES 1',
                        items: [
                            { label: 'Icons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons'] },
                            { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://www.primefaces.org/primeflex/', target: '_blank' }
                        ]
                    }
                ],
            ]
        }
    ];

    constructor(
        public layoutService: LayoutService, 
        public el: ElementRef,
        private router: Router, 
        public accountService: AccountService, 
        public loginService: LoginService,
        private store: Store<AppState>
    ) {}

    ngOnInit(): void {
        
        //this.loadRecentNotifications();
        this.loadUser();

        this.store.dispatch(NotificationAction.loadNotification());

        this.store.pipe(select(notificationSelector.notificationList), takeUntil(this.destroy$)).subscribe(data => {
              this.notifications = data || [];
                this.notificationCount = data.length;
              this.loading = false;
                 // Préparer les notifications pour l'affichage (max 5 dernières)
                    this.recentNotifications = this.formatNotificationsForDisplay(
                        data.slice(0, 5)
                    );
            });        
    }

    /**
     * Charger les notifications récentes (dernières 24h)
     */
    loadRecentNotifications(): void {
        const dateDebut = new Date();
        dateDebut.setHours(dateDebut.getHours() - 24); // Dernières 24 heures
        const dateFin = new Date();

        const searchDto = {
            dateDebut: dateDebut,
            dateFin: dateFin,
            page: 0,
            size: 10, // Limiter à 10 notifications
            sortBy: 'date,desc'
        };

        this.store.dispatch(NotificationAction.loadNotification());
    }
    loadUser(): void {
        this.user = this.loginService.getStoredUser();
    }
     getUserFullName(): string {
        if (!this.user) return 'Utilisateur';
        
        const nom = this.user.nom || '';
        const prenom = this.user.prenom || '';
        
        if (nom && prenom) {
            return `${prenom} ${nom}`;
        }
        
        return nom || prenom || this.user.login || 'Utilisateur';
    }



     getUserInitials(): string {
        if (!this.user) return 'U';
        
        const nom = this.user.nom || '';
        const prenom = this.user.prenom || '';
        
        if (nom && prenom) {
            return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
        }
        
        if (nom) return nom.charAt(0).toUpperCase();
        if (prenom) return prenom.charAt(0).toUpperCase();
        if (this.user.login) return this.user.login.charAt(0).toUpperCase();
        
        return 'U';
    }

     viewProfile(): void {
        this.router.navigate(['/admin/profile']);
    }

    /**
     * Formater les notifications pour l'affichage dans le dropdown
     */
    formatNotificationsForDisplay(notifications: Notification[]): any[] {
        return notifications.map(notif => {
            const nomComplet = `${notif.nom || ''} ${notif.prenom || ''}`.trim();
            const timeAgo = this.getTimeAgo(notif.dateNotification);
            
            return {
                title: 'Alerte Liste Noire',
                message: `${nomComplet} - ${notif.aeroport?.nomAeroport || 'Aéroport inconnu'}`,
                time: timeAgo,
                icon: 'pi-exclamation-triangle',
                type: 'danger',
                data: notif // Garder les données complètes
            };
        });
    }

    /**
     * Calculer le temps écoulé depuis la notification
     */
    getTimeAgo(date: Date | undefined): string {
        if (!date) return 'Date inconnue';
        
        const notifDate = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        
        return notifDate.toLocaleDateString('fr-FR');
    }

    /**
     * Naviguer vers la page complète des notifications
     */
  viewAllNotifications(): void {
    this.router.navigate(['/admin/notification']);  // ✅ Maintenant cohérent avec le menu
}

    /**
     * Gérer le clic sur une notification
     */
    onNotificationClick(notification: any): void {
        // Naviguer vers la page des notifications avec le détail
        this.router.navigate(['/notifications'], {
            queryParams: { id: notification.data?.id }
        });
    }

    get mobileTopbarActive(): boolean {
        return this.layoutService.state.topbarMenuActive;
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onRightMenuButtonClick() {
        // this.layoutService.openRightSidebar();
    }

    onMobileTopbarMenuButtonClick() {
        this.layoutService.onTopbarMenuToggle();
    }

    focusSearchInput(){
       setTimeout(() => {
         this.searchInput.nativeElement.focus()
       }, 0);
    }

    logout() {
        this.loginService.logout();
        this.router.navigate(['/admin/login']);
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}