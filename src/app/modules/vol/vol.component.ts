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
import * as compagnieAction from '../../store/compagnie/action';
import * as aeroportAction from '../../store/aeroport/action';
import * as volSelector from '../../store/vol/selector';
import * as villeSelector from '../../store/ville/selector';
import * as compagnieSelector from '../../store/compagnie/selector';
import * as aeroportSelector from '../../store/aeroport/selector';
import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum } from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { SearchDto, StatutVol, TypeVol, Vol } from 'src/app/store/vol/model';
import { Ville } from 'src/app/store/ville/model';
import { Compagnie } from 'src/app/store/compagnie/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-vol',
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
    templateUrl: './vol.component.html',
    styleUrl: './vol.component.scss'
})
export class VolComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();
    
    // Observables
    volList$!: Observable<Array<Vol>>;
    villeList$!: Observable<Array<Ville>>;
    compagnieList$!: Observable<Array<Compagnie>>;
    aeroportList$!: Observable<Array<Aeroport>>;
    
    // Listes de données
    vols: Vol[] = [];
    villes: Ville[] = [];
    compagnies: Compagnie[] = [];
    aeroports: Aeroport[] = [];
    
    // Objet sélectionné
    vol: Vol = {};
    selectedVol: Vol = {};
    
    // Configuration du tableau
    cols: any[] = [];
    
    // Options pour les dropdowns
    typesVol = [
        { label: 'Arrivée', value: TypeVol.ARRIVEE },
        { label: 'Départ', value: TypeVol.DEPART }
    ];
    
    statutsVol = [
        { label: 'Programmé', value: StatutVol.PROGRAMME },
        { label: 'Confirmé', value: StatutVol.CONFIRME },
        { label: 'Effectué', value: StatutVol.EFFECTUE },
        { label: 'Retardé', value: StatutVol.RETARDE },
        { label: 'Annulé', value: StatutVol.ANNULE }
    ];
    
    // État du formulaire et recherche
    keyword = '';
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 10;
    volDialog: boolean = false;
    filterDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    volFormGroup!: FormGroup;
    filterFormGroup!: FormGroup;
    popupHeader = 'Enregistrer un vol';

    // Filtres de recherche
    selectedStatuts: StatutVol[] = [StatutVol.PROGRAMME];
   
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    isDetailModalOpen = false;
    label = "Aéroport arrivé";

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>, 
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        // Définir les colonnes du tableau
        this.cols = [
            { field: 'numero', header: 'Numéro de vol' },
            { field: 'villeNomD', header: 'Ville de départ' },
            { field: 'villeNomA', header: 'Ville d\'arrivée' },
            { field: 'typeVol', header: 'Type de vol' },
            { field: 'compagnie.nom', header: 'Compagnie' },
            { field: 'aeroport.nomAeroport', header: 'Aéroport' },
            { field: 'dateDepart', header: 'Date de départ' },
            { field: 'dateArrivee', header: 'Date d\'arrivée' },
            { field: 'statut', header: 'Statut' }
        ];
        
        
        this.createFormSearch();
        this.createFormVol();
        this.createFormFilter();
        
        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        // Charger les vols avec filtres par défaut
        this.loadVolsWithFilters();

        // Charger les villes
        this.villeList$ = this.store.pipe(select(villeSelector.villeList));
        this.store.dispatch(villeAction.loadVille());
        
        this.villeList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.villes = [...value];
                    console.log('=== Villes assignées ===', this.villes);
                }
            });

        // Charger les compagnies
        this.compagnieList$ = this.store.pipe(select(compagnieSelector.compagnieList));
        this.store.dispatch(compagnieAction.loadCompagnie());
        
        this.compagnieList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.compagnies = [...value];
                    console.log('=== Compagnies assignées ===', this.compagnies);
                }
            });

        // Charger les aéroports
        this.aeroportList$ = this.store.pipe(select(aeroportSelector.aeroportList));
        this.store.dispatch(aeroportAction.loadAeroport());
        
        this.aeroportList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.aeroports = [...value];
                    console.log('=== Aéroports assignés ===', this.aeroports);
                }
            });

        // Écouter les résultats des vols
        this.volList$ = this.store.pipe(select(volSelector.volList));
        this.volList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                console.log('=== Vols reçus ==111=', value);
                if (value) {
                    this.loading = false;
                    this.vols = [...value];
                    console.log('=== Vols reçus ===', value);
                } else { 
                    this.loading = false;
                }
            });
 
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
                    this.loadVolsWithFilters();
                }
            }
        });
    }

    foundAeroport() {
        if(this.volFormGroup.get('typeVol')?.value == TypeVol.ARRIVEE){
            this.label = "Aéroport depart";
        } else {
             this.label = "Aéroport arrivé";
        }
    }
    // Ouvrir le modal de détail
  openDetailModal(vol: Vol) {
    this.selectedVol = vol;
    this.isDetailModalOpen = true;
  }
  
  // Fermer le modal de détail
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedVol = {};
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
            statutVols: [[]]
        });
    }

    createFormVol(): void {
        this.volFormGroup = this.fb.group({
            id: [null],
            numero: ['', [Validators.required, Validators.minLength(2)]],
            typeVol: ['', [Validators.required]],
            compagnie: [null, [Validators.required]],
            aeroport: [null, [Validators.required]],
            /* villeDepart: [null, [Validators.required]],
            villeArrivee: [null, [Validators.required]], */
            dateDepart: [null, [Validators.required]],
            dateArrivee: [null, [Validators.required]],
            statut: [StatutVol.PROGRAMME, [Validators.required]]
        });
    }

    loadVolsWithFilters(): void {
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
            statutVols: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows,
            sortBy: 'dateDepart,desc'
        };

        console.log('=== SearchDto envoyé ===', searchDto);
        this.store.dispatch(volAction.loadVolsByPeriode({ searchDto }));
    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statutVols:  this.selectedStatuts
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
        this.selectedStatuts = formValue.statutVols || [];
        
        this.page = 0;
        this.first = 0;
        
        this.filterDialog = false;
        this.loadVolsWithFilters();
    }

    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.selectedStatuts = [];
        
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statutVols: []
        });
        
        this.page = 0;
        this.first = 0;
        
        this.loadVolsWithFilters();
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadVolsWithFilters();
    }

    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    openNew(): void {
        this.vol = {};
        this.volFormGroup.reset();
        this.volFormGroup.patchValue({ statut: StatutVol.PROGRAMME });
        this.popupHeader = 'Enregistrer un vol';
        this.isUpdate = false;
        this.volDialog = true;
    }
removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

    update(form: Vol): void {
        this.popupHeader = 'Modifier un vol';
        const selectedTypeVol =TypeVol.DEPART;
        if (!form.typeVol && form.typeVol?.toString() === 'Arrivée') {
            form.typeVol = TypeVol.ARRIVEE;
        }
        this.volFormGroup.patchValue({
            id: form.id,
            numero: form.numero,
            typeVol: this.typesVol.find(t => this.removeAccents(t.label).toUpperCase() === form.typeVol?.toString().toUpperCase())?.value,
            compagnie: form.compagnie,
            aeroport: form.aeroport,
            villeDepart: form.villeDepart,
            villeArrivee: form.villeArrivee,
            dateDepart: form.dateDepart ? new Date(form.dateDepart) : null,
            dateArrivee: form.dateArrivee ? new Date(form.dateArrivee) : null,
            statut: this.statutsVol.find(s =>  this.removeAccents(s.label).toUpperCase() === form.statut?.toString())?.value
        });
        
        this.vol = { ...form };
        this.volDialog = true;
        this.isUpdate = true;
    }

    onSave(): void {
        if (this.volFormGroup.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires',
                life: 3000
            });
            return;
        }

        const formValue = this.volFormGroup.value;
        
        const volToSave: Vol = {
            numero: formValue.numero?.trim().toUpperCase(),
            typeVol: formValue.typeVol,
            compagnieId: formValue.compagnie?.id,
            aeroportId: formValue.aeroport?.id,
            villeDepartId: formValue.villeDepart?.id,
            villeArriveeId: formValue.villeArrivee?.id,
            dateDepart: formValue.dateDepart,
            dateArrivee: formValue.dateArrivee,
            statut: formValue.statut
        };
        
        if (this.isUpdate && formValue.id) {
            volToSave.id = formValue.id;
        }
        
        console.log("===== COMPOSANT - Objet Vol à dispatcher =====", volToSave);

        this.confirmationService.confirm({
            message: this.isUpdate ? 
                'Êtes-vous sûr de vouloir modifier ce vol?' : 
                'Êtes-vous sûr de vouloir ajouter ce vol?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (this.isUpdate) {
                    this.store.dispatch(volAction.updateVol({ vol: volToSave }));
                } else {
                    this.store.dispatch(volAction.createVol({ vol: volToSave }));
                }
                
                this.resetForm();
            }
        });
    }

    private resetForm(): void {
        this.volFormGroup.reset();
        this.vol = {};
        this.volDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un vol';
    }

    confirmDelete(vol: Vol): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le vol "${vol.numero}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteVol(vol);
            }
        });
    }

    deleteVol(vol: Vol): void {
        this.store.dispatch(volAction.deleteVol({ vol }));
    }

    confirmChangeStatus(vol: Vol): void {
        const newStatus: StatutVol = vol.statut === StatutVol.CONFIRME ? 
            StatutVol.ANNULE : 
            StatutVol.CONFIRME;
        const action = newStatus === StatutVol.CONFIRME ? 'confirmer' : 'annuler';
        
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir ${action} le vol "${vol.numero}" ?`,
            header: 'Confirmation de changement de statut',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: vol.statut === StatutVol.CONFIRME ? 
                'p-button-warning' : 
                'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, ' + action,
            rejectLabel: 'Annuler',
            accept: () => {
                const updatedVol: Vol = { 
                    ...vol, 
                    statut: newStatus 
                };
                this.store.dispatch(volAction.changerStatusVol({ vol: updatedVol }));
            }
        });
    }

    getTypeVolSeverity(type: TypeVol | undefined): string {
    switch (type) {
      case TypeVol.ARRIVEE:
        return 'info';
      case TypeVol.DEPART:
        return 'success';
      default:
        return 'secondary';
    }
  }
    getStatutClass(statut: string | undefined): string {
        if (!statut) return 'badge-secondary';
        
        switch (statut) {
            case StatutVol.CONFIRME.toString():
                return 'badge-primary';
            case StatutVol.EFFECTUE.toString():
                return 'badge-success';
            case StatutVol.ANNULE.toString():
                return 'badge-danger';
            case StatutVol.PROGRAMME.toString():
                console.log('=== PROGRAMME ===');
                return 'badge-warning';
            case StatutVol.RETARDE.toString():
                return 'badge-warning'; 
            default:
                return 'badge-secondary';
        }
    }

    getStatutDetail(statut: StatutVol | undefined): string {
    if (!statut) return 'secondary';
    
    switch (statut.toString()) {
      case StatutVol.CONFIRME.toString():
        return 'primary';
      case StatutVol.EFFECTUE.toString():
        return 'success';
      case StatutVol.ANNULE.toString():
        return 'danger';
      case StatutVol.PROGRAMME.toString():
        console.log('=== PROGRAMME ===');
        return 'warning';
      case StatutVol.RETARDE.toString():
        return 'warning';
      default:
        return 'secondary';
    }
  }

    cancel(): void {
        this.volFormGroup.reset();
        this.vol = {};
        this.volDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un vol';
    }

    cancelFilter(): void {
        this.filterDialog = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}