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

/**
 * Interface pour les notifications formatées pour l'affichage
 */
interface DisplayNotification {
    id: string | number;
    title: string;
    message: string;
    time: string;
    icon: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'danger';
    isRead?: boolean;
    data: Notification;
}

/**
 * Composant Topbar optimisé
 * Gère l'affichage de la barre supérieure avec notifications et profil utilisateur
 */
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
    private destroy$ = new Subject<boolean>();
    notificationList$!: Observable<Array<Notification>>;
    notifications: Notification[] = [];
    notificationCount = 0;
    recentNotifications: DisplayNotification[] = [];
    loading = true;
    activeItem!: number;
    user: User | null = null;

    // Limite de notifications affichées dans le dropdown
    private readonly MAX_DISPLAYED_NOTIFICATIONS = 5;

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
        this.loadUser();
        this.initializeNotifications();
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    // ============================================================================
    // INITIALISATION
    // ============================================================================

    /**
     * Initialise le système de notifications
     */
    private initializeNotifications(): void {
        this.store.dispatch(NotificationAction.loadNotification());

        this.store.pipe(
            select(notificationSelector.notificationList),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (data) => {
                this.notifications = data || [];
                this.notificationCount = data?.length || 0;
                this.recentNotifications = this.formatNotificationsForDisplay(
                    data?.slice(0, this.MAX_DISPLAYED_NOTIFICATIONS) || []
                );
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des notifications:', error);
                this.loading = false;
            }
        });
    }

    /**
     * Charge les données de l'utilisateur connecté
     */
    private loadUser(): void {
        this.user = this.loginService.getStoredUser();
    }

    // ============================================================================
    // GESTION DES NOTIFICATIONS
    // ============================================================================

    /**
     * Formate les notifications pour l'affichage dans le dropdown
     * @param notifications - Liste des notifications à formater
     * @returns Liste des notifications formatées
     */
    private formatNotificationsForDisplay(notifications: Notification[]): DisplayNotification[] {
        if (!notifications || notifications.length === 0) {
            return [];
        }

        return notifications.map(notif => {
            const nomComplet = this.formatFullName(notif.nom, notif.prenom);
            const timeAgo = this.getTimeAgo(notif.dateNotification);
            const aeroport = notif.aeroport?.nomAeroport || 'Aéroport inconnu';
            
            return {
                id: notif.id || Date.now(),
                title: 'Alerte Liste Noire',
                message: `${nomComplet} - ${aeroport}`,
                time: timeAgo,
                icon: 'pi-exclamation-triangle',
                type: 'danger',
                isRead:   false,
                data: notif
            };
        });
    }

    /**
     * Formate le nom complet à partir du nom et prénom
     */
    private formatFullName(nom?: string, prenom?: string): string {
        const fullName = `${prenom || ''} ${nom || ''}`.trim();
        return fullName || 'Utilisateur inconnu';
    }

    /**
     * Calcule le temps écoulé depuis la notification
     * @param date - Date de la notification
     * @returns Chaîne formatée du temps écoulé
     */
    private getTimeAgo(date: Date | undefined): string {
        if (!date) return 'Date inconnue';
        
        try {
            const notifDate = new Date(date);
            const now = new Date();
            const diffMs = now.getTime() - notifDate.getTime();

            // Vérifier que la date est valide
            if (isNaN(diffMs)) return 'Date invalide';
            
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'À l\'instant';
            if (diffMins < 60) return `Il y a ${diffMins} min`;
            if (diffHours < 24) return `Il y a ${diffHours}h`;
            if (diffDays < 7) return `Il y a ${diffDays}j`;
            
            return notifDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Erreur lors du calcul du temps écoulé:', error);
            return 'Date invalide';
        }
    }

    /**
     * Gère le clic sur une notification
     * @param notification - Notification cliquée
     */
    onNotificationClick(notification: DisplayNotification): void {
        // TODO: Marquer la notification comme lue si nécessaire
        // this.store.dispatch(NotificationAction.markAsRead({ id: notification.id }));

        // Navigation vers la page des notifications avec le détail
        this.router.navigate(['/admin/notification'], {
            queryParams: { id: notification.data?.id }
        });
    }

    /**
     * Navigation vers la page complète des notifications
     */
    viewAllNotifications(): void {
        this.router.navigate(['/admin/notification']);
    }

    /**
     * TrackBy pour optimiser le rendu de la liste de notifications
     */
    trackByNotificationId(index: number, notification: DisplayNotification): string | number {
        return notification.id;
    }

    // ============================================================================
    // GESTION DU PROFIL UTILISATEUR
    // ============================================================================

    /**
     * Retourne le nom complet de l'utilisateur
     */
    getUserFullName(): string {
        if (!this.user) return 'Utilisateur';
        
        const nom = this.user.nom?.trim() || '';
        const prenom = this.user.prenom?.trim() || '';
        
        if (nom && prenom) {
            return `${prenom} ${nom}`;
        }
        
        return nom || prenom || this.user.login || 'Utilisateur';
    }

    /**
     * Retourne les initiales de l'utilisateur
     */
    getUserInitials(): string {
        if (!this.user) return 'U';
        
        const nom = this.user.nom?.trim() || '';
        const prenom = this.user.prenom?.trim() || '';
        
        if (nom && prenom) {
            return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
        }
        
        if (prenom) return prenom.charAt(0).toUpperCase();
        if (nom) return nom.charAt(0).toUpperCase();
        if (this.user.login) return this.user.login.charAt(0).toUpperCase();
        
        return 'U';
    }

    /**
     * Navigation vers le profil utilisateur
     */
    viewProfile(): void {
        this.router.navigate(['/admin/profile']);
    }

    /**
     * Déconnexion de l'utilisateur
     */
    logout(): void {
        this.loginService.logout();
        this.router.navigate(['/admin/login']);
    }

    // ============================================================================
    // GESTION DU LAYOUT
    // ============================================================================

    /**
     * Getter pour l'état du menu mobile
     */
    get mobileTopbarActive(): boolean {
        return this.layoutService.state.topbarMenuActive;
    }

    /**
     * Gère le clic sur le bouton menu
     */
    onMenuButtonClick(): void {
        this.layoutService.onMenuToggle();
    }

    /**
     * Gère le clic sur le bouton menu mobile
     */
    onMobileTopbarMenuButtonClick(): void {
        this.layoutService.onTopbarMenuToggle();
    }

    /**
     * Gère le clic sur le bouton du menu de droite
     */
    onRightMenuButtonClick(): void {
        // this.layoutService.openRightSidebar();
    }

    /**
     * Focus l'input de recherche
     */
    focusSearchInput(): void {
        setTimeout(() => {
            this.searchInput?.nativeElement?.focus();
        }, 0);
    }
}