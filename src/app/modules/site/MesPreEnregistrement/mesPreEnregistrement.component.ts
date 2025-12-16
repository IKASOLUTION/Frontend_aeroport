// mesPreEnregistrement.component.ts - PÉRIODE ANNÉE COURANTE

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as enregistrementAction from '../../../store/enregistrement/action';
import * as enregistrementSelector from '../../../store/enregistrement/selector';
import * as motifVoyageAction from '../../../store/motifVoyage/action';
import * as motifVoyageSelector from '../../../store/motifVoyage/selector';
import { LoadingSpinnerComponent } from '../../loading-spinner.component';
import { Enregistrement } from 'src/app/store/enregistrement/model';
import { TagModule } from 'primeng/tag';
import { SearchDto } from 'src/app/store/vol/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import * as aeroportAction from '../../../store/aeroport/action';
import * as aeroportSelector from '../../../store/aeroport/selector';
import { Router, RouterModule } from '@angular/router';
import { MotifVoyage, StatutVoyageur } from 'src/app/store/motifVoyage/model';
import { MultiSelectModule } from 'primeng/multiselect';
import { EnregistrementService } from 'src/app/store/enregistrement/service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-public-register',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        LoadingSpinnerComponent,
        ButtonModule,
        RippleModule,
        TooltipModule,
        ToastModule,
        InputTextModule,
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CalendarModule,
        PaginatorModule,
        DialogModule,
        RouterModule,
        MultiSelectModule,
        NavbarComponent,
        TagModule
    ],
    providers: [MessageService],
    templateUrl: './mesPreEnregistrement.component.html',
    styleUrl: './mesPreEnregistrement.component.scss'
})
export class MesPreEnregistrementComponent implements OnInit, OnDestroy {
    @ViewChild('dt') dt!: Table;

    destroy$ = new Subject<boolean>();

    // Listes de données
    enregistrementList = signal<Enregistrement[]>([]);
    listeVols = signal<Enregistrement[]>([]);

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
    isEditing: boolean = false;
    originalEnregistrement: Enregistrement = {};
    
    statutsVol = [
        { label: 'Validé', value: StatutVoyageur.VALIDE },
        { label: 'En attente', value: StatutVoyageur.EN_ATTENTE },
        { label: 'Annulé', value: StatutVoyageur.ANNULE },
        { label: 'Rejeté', value: StatutVoyageur.REJETE }
    ];

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>,
        private router: Router,
        private messageService: MessageService,
        private enregistrementService: EnregistrementService
    ) { }

    ngOnInit(): void {
        this.createFormSearch();
        this.createFormFilter();

        // ✅ INITIALISER LES DATES DE L'ANNÉE COURANTE
        this.initCurrentYearDates();

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
                }
            });

        // Charger les motifs de voyage
        this.store.dispatch(motifVoyageAction.loadMotifVoyage());
        this.store.pipe(select(motifVoyageSelector.motifVoyageList))
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.motifVoyages = value || [];
                }
            });
    }

    // ✅ NOUVELLE MÉTHODE : Initialiser les dates de l'année courante
    private initCurrentYearDates(): void {
        const currentYear = new Date().getFullYear();
        
        // Date de début : 1er janvier de l'année courante
        this.dateDebut = new Date(currentYear, 0, 1); // Mois 0 = janvier
        
        // Date de fin : 31 décembre de l'année courante
        this.dateFin = new Date(currentYear, 11, 31, 23, 59, 59); // Mois 11 = décembre
        
        console.log('Période chargée:', {
            debut: this.dateDebut.toLocaleDateString('fr-FR'),
            fin: this.dateFin.toLocaleDateString('fr-FR'),
            annee: currentYear
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
            page: this.page,
            size: this.rows,
            sortBy: 'dateVoyage,desc'
        };

        this.store.dispatch(enregistrementAction.loadPreEnregistrementeByPeriode({ searchDto }));
    }

    private subscribeToStoreUpdates(): void {
        // Écouter la liste des enregistrements
        this.store.pipe(
            select(enregistrementSelector.preEnregistrementList),
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

        if (!this.selectedEnregistrement.numeroDocument) {
            console.warn('Le numéro de document est manquant');
            return;
        }

        // Charger l'historique des vols
        this.enregistrementService.ListVols(this.selectedEnregistrement.numeroDocument).subscribe({
            next: (response) => {
                this.listeVols.set(response);
            },
            error: (error) => {
                console.error('Erreur lors de la récupération de l\'historique:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger l\'historique des vols',
                    life: 3000
                });
            }
        });
    }

    getMotifSeverity(motif: string): string {
        const severityMap: { [key: string]: string } = {
            'FAMILLE': 'info',
            'TOURISME': 'success',
            'AFFAIRE': 'warning',
            'ETUDE': 'primary'
        };
        return severityMap[motif] || 'secondary';
    }

    getStatutSeverity(statut: string): string {
        const severityMap: { [key: string]: string } = {
            'EN_ATTENTE': 'warning',
            'VALIDE': 'success',
            'REJETE': 'danger',
            'ANNULE': 'danger',
            'EN_COURS': 'info'
        };
        return severityMap[statut] || 'secondary';
    }

    // Fermer le modal de détail
    closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedEnregistrement = {};
        this.listeVols.set([]);
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
        });
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadEnregistrements();
    }

    onGlobalFilter(table: any, event: Event | { target: HTMLInputElement }): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
        });
        this.filterDialog = true;
    }

    applyFilters(): void {
        const formValue = this.filterFormGroup.value;
        this.dateDebut = formValue.dateDebut;
        this.dateFin = formValue.dateFin;
        this.page = 0;
        this.first = 0;

        this.filterDialog = false;
        this.loadEnregistrements();

        this.messageService.add({
            severity: 'success',
            summary: 'Filtres appliqués',
            detail: 'Vos filtres ont été appliqués avec succès',
            life: 3000
        });
    }

    // ✅ MODIFIÉ : Reset avec les dates de l'année courante
    resetFilters(): void {
        // Réinitialiser avec les dates de l'année courante
        this.initCurrentYearDates();
        
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
        });

        this.page = 0;
        this.first = 0;

        this.loadEnregistrements();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres réinitialisés',
            detail: 'Les filtres ont été réinitialisés à l\'année courante',
            life: 3000
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}