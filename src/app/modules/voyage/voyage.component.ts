import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as enregistrementAction from '../../store/enregistrement/action';
import * as enregistrementSelector from '../../store/enregistrement/selector';
import * as motifVoyageAction from '../../store/motifVoyage/action';
import * as motifVoyageSelector from '../../store/motifVoyage/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { Enregistrement, TypeDocument } from 'src/app/store/enregistrement/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { SearchDto } from 'src/app/store/vol/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import * as voyageAction from '../../store/voyage/action';
import * as voyageSelector from '../../store/voyage/selector';
import * as aeroportAction from '../../store/aeroport/action';
import * as aeroportSelector from '../../store/aeroport/selector';
import { Router, RouterModule } from '@angular/router';
import { MotifVoyage, StatutVoyageur } from 'src/app/store/motifVoyage/model';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Voyage } from 'src/app/store/voyage/model';

@Component({
    selector: 'app-voyageur-attente',
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
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CalendarModule,
        PaginatorModule,
        DialogModule,
        FieldsetModule,
        RouterModule,
        MultiSelectModule,
        TagModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './voyage.component.html',
    styleUrl: './voyage.component.scss'
})
export class VoyageComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();

    // Listes de données
    voyageList = signal<Voyage[]>([]);

    // Objet sélectionné
    selectedVoyage: Voyage = {};
    voyage: Voyage = {};

    // Configuration du tableau
    cols: any[] = [];

    // État du formulaire et recherche
    keyword = '';
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 10;
    filterDialog: boolean = false;
    loading = signal<boolean>(true);
    filterFormGroup!: FormGroup;
    aeroportList$!: Observable<Array<Aeroport>>;
    aeroports: Aeroport[] = [];
    voyages: Voyage[] = [];
    motifVoyages: MotifVoyage[] = [];
    aeroportSelected: Aeroport | null = null;
    motifVoyageSelected: MotifVoyage | null = null;

    // Filtres de recherche
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    isDetailModalOpen = false;
    selectedStatuts: StatutVoyageur[] = [];
    statutsVol = [
        { label: 'Validé', value: StatutVoyageur.VALIDE },
        { label: 'En_attente', value: StatutVoyageur.EN_ATTENTE },
        { label: 'Annulé', value: StatutVoyageur.ANNULE },
        { label: 'Rejeté', value: StatutVoyageur.REJETE }
    ];

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Définir les colonnes du tableau
        this.cols = [
  { field: 'vol.numeroVol', header: 'N° Vol' },
  { field: 'villeDepart.nom', header: 'Ville départ' },
  { field: 'villeDestination.nom', header: 'Destination' },
  { field: 'dateVoyage', header: 'Date voyage' },
  { field: 'heureVoyage', header: 'Heure voyage' },
  { field: 'EtatVoyage', header: 'État du voyage' },
  { field: 'StatutVoyage', header: 'Statut' },
  { field: 'aeroport.nomAeroport', header: 'Aéroport' }
];

        this.createFormSearch();

        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();

        // Charger les voyages

          this.store.dispatch(voyageAction.loadVoyage());
            this.store.pipe(select(voyageSelector.voyageList), takeUntil(this.destroy$)).subscribe(data => {
              this.loading.set(false);
                this.voyages = data || [];
            
            });   
            
             this.aeroportList$ = this.store.pipe(select(aeroportSelector.aeroportList));
                    this.store.dispatch(aeroportAction.loadAeroport());
            
                    this.aeroportList$.pipe(takeUntil(this.destroy$))
                        .subscribe(value => {
                            if (value) {
                                this.aeroports = [...value];
                                console.log('=== Aéroports assignés ===', this.aeroports);
                            }
                        });
    }

  



   
    // Sélectionner un enregistrement pour le détail
    selectVoyage(voyage: Voyage): void {

        this.store.dispatch(voyageAction.getVoyage(voyage));
        this.openDetailModal(voyage);
    }

    // Ouvrir le modal de détail
    openDetailModal(voyage: Voyage): void {
        this.selectedVoyage = voyage;
        this.isDetailModalOpen = true;
    }

    // Fermer le modal de détail
    closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedVoyage = {};
    }

    closeFilterDialog(): void {
        this.filterDialog = false;
    }

    createFormSearch(): void {
        this.formSearch = this.fb.group({
            keyword: [null]
        });
    }

   


    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

   

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroport: this.aeroportSelected,
           
        });
        this.filterDialog = true;
    }

   

  

    cancelFilter(): void {
        this.filterDialog = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}