import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as volAction from '../../store/vol/action';
import * as villeAction from '../../store/ville/action';
import * as NotificationAction from '../../store/notification/action';
import * as aeroportAction from '../../store/aeroport/action';
import * as volSelector from '../../store/vol/selector';
import * as villeSelector from '../../store/ville/selector';
import * as notificationSelector from '../../store/notification/selector';
import * as aeroportSelector from '../../store/aeroport/selector';
import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum } from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { SearchDto, StatutVol, TypeVol, Vol } from 'src/app/store/vol/model';
import { Notification } from 'src/app/store/notification/model';
import { Compagnie } from 'src/app/store/compagnie/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        LoadingSpinnerComponent,
        ButtonModule, 
        RippleModule, 
        TooltipModule, 
        ToolbarModule, 
        ToastModule, 
        InputTextModule,
        InputTextareaModule,
        FormsValidationComponent,
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CalendarModule,
        MultiSelectModule,
        SplitButtonModule, 
        PaginatorModule, 
        DialogModule, 
        FieldsetModule,
        TagModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();
    
    // Observables
    notificationList$!: Observable<Array<Notification>>;
    aeroportList$!: Observable<Array<Aeroport>>;
    
    // Listes de données
    notifications: Notification[] = [];
    aeroports: Aeroport[] = [];
    
    // Objet sélectionné
    
    selectedNotification: Notification = {};
    
    // Configuration du tableau
    cols: any[] = [];
    
    // Options pour les dropdowns
   
    
    // État du formulaire et recherche
    keyword = '';
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 10;
    notificationDialog: boolean = false;
    filterDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    notificationFormGroup!: FormGroup;
    filterFormGroup!: FormGroup;
    popupHeader = 'Enregistrer une notification';

    // Filtres de recherche
   
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    isDetailModalOpen = false;

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>, 
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        // Définir les colonnes du tableau
        this.cols = [
            { field: 'nomComplet', header: 'Personne Détectée' },
            { field: 'date', header: 'Date / Heure' },
            { field: 'numeroNip', header: 'NIP' },
            { field: 'numeroCnib', header: 'CNIB' },
            { field: 'aeroport.nomAeroport', header: 'Aeroport' },
            { field: 'user.nom', header: 'Agent en charge' },
            { field: 'statut', header: 'Statut' }
        ];
        this.createFormSearch();
        this.createFormFilter();
        
        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        
        // Charger les vols avec filtres par défaut
        this.loadNotificationsWithFilters();
        // Charger les aéroports
        this.aeroportList$ = this.store.pipe(select(aeroportSelector.aeroportList));
        this.store.dispatch(aeroportAction.loadAeroport());
        this.aeroportList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.aeroports = [...value];
                }
            });
        // Écouter les résultats des vols
        this.notificationList$ = this.store.pipe(select(notificationSelector.notificationList));
        this.notificationList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    console.log('=== Valeur reçue du store ===', value);
                    this.loading = false;
                    this.notifications = [...value];
                    console.log('=== Notifications reçues du store ===', this.notifications);
                } else { 
                    this.loading = false;
                }
            });

        this.loadNotifications();
        // Écouter le total d'items pour la pagination
        this.store.pipe(
            select(volSelector.volTotalItems),
            takeUntil(this.destroy$)
        ).subscribe(total => {
            if (total !== undefined) {
                this.totalItems = total;
            }
        });

        // Écouter les statuts (success, error, warning)
        this.store.pipe(
            select(globalSelector.status),
            takeUntil(this.destroy$)
        ).subscribe(status => {
            if (status && status.message) {
                this.showToast(status.status, status.message);
                
                // Recharger après une opération réussie
                if (status.status === StatusEnum.success) {
                    this.loadNotificationsWithFilters();
                }
            }
        });
    }

    // Ouvrir le modal de détail
  openDetailModal(notification: Notification) {
    this.selectedNotification = notification;
    this.isDetailModalOpen = true;
  }
  loadNotifications() {
    // Après avoir récupéré vos notifications
    this.notifications = this.notifications.map(notif => ({
        ...notif,
        nomComplet: `${notif.nom || ''} ${notif.prenom || ''}`.trim()
    }));
}
  
  // Fermer le modal de détail
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedNotification = {};
  }
     closeFilterDialog(): void {
        this.filterDialog = false;
    }

    private showToast(status: StatusEnum, message: string): void {
        this.messageService.clear();

        switch (status) {
            case StatusEnum.success:
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: message,
                    life: 3000
                });
                break;

            case StatusEnum.error:
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: message,
                    life: 5000
                });
                break;

            case StatusEnum.warning:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Attention',
                    detail: message,
                    life: 4000
                });
                break;
        }
    }

    createFormSearch(): void {
        this.formSearch = this.fb.group({
            keyword: [null]
        });
    }

    createFormFilter(): void {
        this.filterFormGroup = this.fb.group({
            dateDebut: [this.dateDebut, Validators.required],
            dateFin: [this.dateFin, Validators.required],
            aeroports: [[]]
        });
    }

    loadNotificationsWithFilters(): void {
        if (!this.dateDebut || !this.dateFin) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une période',
                life: 3000
            });
            return;
        }

        if (this.dateDebut > this.dateFin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'La date de début doit être avant la date de fin',
                life: 3000
            });
            return;
        }

        this.loading = true;

        const searchDto: SearchDto = {
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            page: this.page,
            size: this.rows,
            sortBy: 'dateDepart,desc'
        };

        console.log('=== SearchDto envoyé ===', searchDto);
        this.store.dispatch(NotificationAction.loadNotificationByPeriode({ searchDto }));
    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroports:  this.aeroports
        });
        this.filterDialog = true;
    }
    applyFilters(): void {
        if (this.filterFormGroup.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires',
                life: 3000
            });
            return;
        }
        const formValue = this.filterFormGroup.value;
        this.dateDebut = formValue.dateDebut;
        this.dateFin = formValue.dateFin;
        this.aeroports = formValue.aeroport || [];  
        this.page = 0;
        this.first = 0; 
        this.filterDialog = false;
        this.loadNotificationsWithFilters();
    }
    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.aeroports = [];
        
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroports: []
        });
        
        this.page = 0;
        this.first = 0;
        
        this.loadNotificationsWithFilters();
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadNotificationsWithFilters();
    }

    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }
removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}