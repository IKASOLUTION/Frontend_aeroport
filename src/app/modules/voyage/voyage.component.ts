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
import * as voyageAction from '../../store/voyage/action';
import * as villeAction from '../../store/ville/action';
import * as compagnieAction from '../../store/compagnie/action';
import * as aeroportAction from '../../store/aeroport/action';
import * as volSelector from '../../store/vol/selector';
import * as villeSelector from '../../store/ville/selector';
import * as compagnieSelector from '../../store/compagnie/selector';
import * as voyageSelector from '../../store/voyage/selector';

import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum, StatutVoyage } from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { SearchDto, StatutVol, TypeVol, Vol } from 'src/app/store/vol/model';
import { Ville } from 'src/app/store/ville/model';
import { Compagnie } from 'src/app/store/compagnie/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { Voyage } from 'src/app/store/voyage/model';

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
    templateUrl: './voyage.component.html',
    styleUrl: './voyage.component.scss'
})
export class VoyageComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();
    
    // Observables
    voyageList$!: Observable<Array<Voyage>>;
   
    
    // Listes de données
    voyages: Voyage[] = [];
  
    // Objet sélectionné
    voyage: Voyage = {};
    selectedVoyage: Voyage = {};
    
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

     statutsVoyage = [
        { label: 'Actif', value: StatutVoyage.ACTIF },
        { label: 'Inactif', value: StatutVoyage.INACTIF },
        { label: 'Annulé', value: StatutVoyage.ANNULE }
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
    voyageDialog: boolean = false;
    filterDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    volFormGroup!: FormGroup;
    filterFormGroup!: FormGroup;
    popupHeader = 'Enregistrer un vol';

    // Filtres de recherche
    selectedStatuts: StatutVoyage[] = [StatutVoyage.ACTIF];
    
   
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
                { field: 'vol.numeroVol', header: 'N° Vol' },
                { field: 'passager', header: 'Passager' },
                { field: 'villeDepart.nom', header: 'Ville départ' },
                { field: 'villeDestination.nom', header: 'Destination' },
                { field: 'dateVoyage', header: 'Date voyage' },
                { field: 'heureVoyage', header: 'Heure voyage' },
                { field: 'EtatVoyage', header: 'État du voyage' },
                { field: 'StatutVoyage', header: 'Statut' },
                { field: 'aeroport.nomAeroport', header: 'Aéroport' }
        ];


        
        
        
        this.createFormSearch();
        this.createFormFilter();
        
        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        // Charger les vols avec filtres par défaut
        this.loadVoyagesWithFilters();

        // Charger les villes
       
     

        // Écouter les résultats des vols
        this.voyageList$.pipe(takeUntil(this.destroy$))
    .subscribe(value => {
        console.log('=== Données voyages reçues ===', value);
        
        if (value && value.length > 0) {
            console.log('=== Premier voyage détaillé ===');
            const firstVoyage = value[0];
            console.log('ID:', firstVoyage.id);
            console.log('Vol:', firstVoyage.vol);
            console.log('Nom voyageur:', firstVoyage.nomVoyageur);
            console.log('Prénom voyageur:', firstVoyage.prenomVoyageur);
            console.log('Ville Nom D:', firstVoyage.villeNomD);
            console.log('Ville Nom A:', firstVoyage.villeNomA);
            console.log('Nom Agent Aéroport:', firstVoyage.nomAgentConnecteAeroport);
            console.log('Statut:', firstVoyage.statut);
            console.log('Motif:', firstVoyage.motifVoyage);
            console.log('Durée séjour:', firstVoyage.dureeSejour);
        }
        
        if (value) {
            this.loading = false;
            this.voyages = [...value];
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
                    this.loadVoyagesWithFilters();
                }
            }
        });
    }

    getPassagerFormate(voyage: Voyage): string {
            if (!voyage) return '';
            
            const nom = (voyage.nomVoyageur || '').toUpperCase();
            const prenom = voyage.prenomVoyageur || '';
            
            // Première lettre en majuscule pour le prénom
            const prenomFormate = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
            
            if (!nom && !prenom) return 'Non renseigné';
            
            return `${prenomFormate} ${nom}`.trim();
}

    foundAeroport() {
        if(this.volFormGroup.get('typeVol')?.value == TypeVol.ARRIVEE){
            this.label = "Aéroport depart";
        } else {
             this.label = "Aéroport arrivé";
        }
    }
    // Ouvrir le modal de détail
  openDetailModal(voyage: Voyage) {
    this.selectedVoyage= voyage;
    this.isDetailModalOpen = true;
  }
  
  // Fermer le modal de détail
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedVoyage = {};
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
            statutVoyages: [[]]
        });
    }

   
    loadVoyagesWithFilters(): void {
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
            statutVoyage: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows,
            sortBy: 'dateDepart,desc'
        };

        console.log('=== SearchDto envoyé ===', searchDto);
        this.store.dispatch(voyageAction.loadVoyagesByPeriode({ searchDto }));
    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statutVoyages:  this.selectedStatuts
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
        this.selectedStatuts = formValue.statutVoyages || [];
        
        this.page = 0;
        this.first = 0;
        
        this.filterDialog = false;
        this.loadVoyagesWithFilters();
    }

    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.selectedStatuts = [];
        
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statutVoyages: []
        });
        
        this.page = 0;
        this.first = 0;
        
        this.loadVoyagesWithFilters();
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadVoyagesWithFilters();
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
            case StatutVoyage.ANNULE.toString():
                return 'badge-primary';
            case StatutVoyage.ACTIF.toString():
                return 'badge-success';
            case StatutVoyage.INACTIF.toString():
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    }

    getStatutDetail(statut: StatutVoyage | undefined): string {
    if (!statut) return 'secondary';
    
    switch (statut.toString()) {
      case StatutVoyage.ANNULE.toString():
        return 'primary';
      case StatutVoyage.ACTIF.toString():
        return 'success';
      case StatutVoyage.INACTIF.toString():
        return 'danger';
      default:
        return 'secondary';
    }
  }

    cancel(): void {
        this.volFormGroup.reset();
        this.voyage = {};
        this.voyageDialog = false;
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