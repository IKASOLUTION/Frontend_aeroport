import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
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
import * as aeroportAction from '../../store/aeroport/action';
import * as aeroportSelector from '../../store/aeroport/selector';
import { Router, RouterModule } from '@angular/router';
import { MotifVoyage, StatutVoyageur } from 'src/app/store/motifVoyage/model';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-register',
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
        TagModule
    ],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();

    // Listes de données
    enregistrementList = signal<Enregistrement[]>([]);

    // Objet sélectionné
    selectedEnregistrement: Enregistrement = {};

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
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Définir les colonnes du tableau
        this.cols = [
            { field: 'nomFamille', header: 'Nom' },
            { field: 'prenom', header: 'Prénom' },
            { field: 'typeDocument', header: 'Type document' },
            { field: 'numeroDocument', header: 'N° document' },
            { field: 'nationalite', header: 'Nationalité' },
            { field: 'villeDepart', header: 'Ville départ' },
            { field: 'villeDestination', header: 'Destination' },
            { field: 'dateVoyage', header: 'Date vol' },
            { field: 'motifVoyage', header: 'Motif' }
        ];

        this.createFormSearch();
        this.createFormFilter();

        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();

        // Charger les données
        this.loadEnregistrements();
        this.subscribeToStoreUpdates();
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


        this.store.dispatch(motifVoyageAction.loadMotifVoyage());

        this.store.pipe(select(motifVoyageSelector.motifVoyageList)).pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.motifVoyages = value || [];
                }
            });
    }

    private loadEnregistrements(): void {
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

        this.loading.set(true);

        const searchDto: SearchDto = {
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroportId: this.aeroportSelected ? this.aeroportSelected.id : 0,
            status: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows,
            sortBy: 'dateVoyage,desc'
        };

        console.log('=== SearchDto envoyé ===', searchDto);
        this.store.dispatch(enregistrementAction.loadEnregistrementsByPeriode({ searchDto }));
    }





    private subscribeToStoreUpdates(): void {
        // Écouter la liste des enregistrements
        this.store.pipe(
            select(enregistrementSelector.enregistrementList),
            takeUntil(this.destroy$)
        ).subscribe(value => {
            this.loading.set(false);
            if (value) {
                this.enregistrementList.set(value);
            }
        });

        // Écouter le total d'items pour la pagination
        this.store.pipe(
            select(enregistrementSelector.enregistrementTotalItems),
            takeUntil(this.destroy$)
        ).subscribe(total => {
            if (total !== undefined) {
                this.totalItems = total;
            }
        });
    }

    // Sélectionner un enregistrement pour le détail
    selectEnregistrement(enregistrement: Enregistrement): void {
        this.store.dispatch(enregistrementAction.selecteEnregistrement({ enregistrement }));
        this.openDetailModal(enregistrement);
    }

    // Ouvrir le modal de détail
    openDetailModal(enregistrement: Enregistrement): void {
        this.selectedEnregistrement = enregistrement;
        this.isDetailModalOpen = true;
    }

    // Fermer le modal de détail
    closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedEnregistrement = {};
    }

    closeFilterDialog(): void {
        this.filterDialog = false;
    }

    createFormSearch(): void {
        this.formSearch = this.fb.group({
            keyword: [null]
        });
    }

    createFormFilter(): void {
        this.aeroportSelected = null;
        this.filterFormGroup = this.fb.group({
            dateDebut: [this.dateDebut],
            dateFin: [this.dateFin],
            aeroport: [null],
            statutVoyages: [null]
        });
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadEnregistrements();
    }

    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    /* getMotifVoyageSeverity(motif: MotifVoyage | undefined): string {
        switch (motif) {
            case MotifVoyage.TOURISME:
                return 'info';
            case MotifVoyage.AFFAIRES:
                return 'warning';
            case MotifVoyage.FAMILLE:
                return 'success';
            case MotifVoyage.ETUDES:
                return 'primary';
            default:
                return 'secondary';
        }
    } */

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroport: this.aeroportSelected,
            statutVoyages: this.selectedStatuts
        });
        this.filterDialog = true;
    }

    applyFilters(): void {
        const formValue = this.filterFormGroup.value;
        this.dateDebut = formValue.dateDebut;
        this.dateFin = formValue.dateFin;
        this.aeroportSelected = formValue.aeroport;
        this.selectedStatuts = formValue.statutVoyages;

        this.page = 0;
        this.first = 0;

        this.filterDialog = false;
        this.loadEnregistrements();
    }

    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.aeroportSelected = null;
        this.motifVoyageSelected = null;

        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroport: null,
            statutVoyages: []
        });

        this.page = 0;
        this.first = 0;

        this.loadEnregistrements();
    }

    cancelFilter(): void {
        this.filterDialog = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}