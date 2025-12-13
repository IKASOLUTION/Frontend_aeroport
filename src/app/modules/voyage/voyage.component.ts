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
import { Enregistrement } from 'src/app/store/enregistrement/model';
import { co } from '@fullcalendar/core/internal-common';

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
     StatutVol = StatutVol;
       TypeVol = TypeVol;
  
    // Objet sélectionné
    voyage: Voyage = {};
    selectedVoyage: Voyage = {};
    
    // Configuration du tableau
    cols: any[] = [];
    isDetailModalOpen = false;
    

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

        

        // Écouter les résultats des voyages
    
        this.voyageList$ = this.store.pipe(select(voyageSelector.voyageList));
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
            select(voyageSelector.voyageTotalItems),
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
    console.log('Voyage sélectionné pour le détail:', this.selectedVoyage);
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

  imprimerFicheVoyage(voyage: Voyage) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.write(this.generateFicheHTML(voyage));
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
}

private generateFicheHTML(voyage: any): string {
    const dateNaissance = voyage.dateNaissance ? new Date(voyage.dateNaissance) : null;
    const jour = dateNaissance?.getDate() || '';
    const mois = dateNaissance?.getMonth() ? dateNaissance.getMonth() + 1 : '';
    const annee = dateNaissance?.getFullYear() || '';
    
    const motifAffaire = voyage.motifVoyage === 'AFFAIRE' ? 'checked' : '';
    const motifFamille = voyage.motifVoyage === 'FAMILLE' ? 'checked' : '';
    const motifEtude = voyage.motifVoyage === 'ETUDE' ? 'checked' : '';
    const motifAutre = !['AFFAIRE', 'FAMILLE', 'ETUDE'].includes(voyage.motifVoyage) ? 'checked' : '';
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Carte Internationale d'Embarquement/Débarquement</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            padding: 20px;
        }
        
        .carte {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 15mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
        }
        
        .flag {
            height: 40px;
            display: flex;
            margin: 0 auto 10px;
            width: 100%;
        }
        
        .flag-red {
            background: #EF2B2D;
            height: 100%;
            flex: 1;
            position: relative;
        }
        
        .flag-green {
            background: #009E49;
            height: 100%;
            flex: 1;
        }
        
        .star {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #FCD116;
            font-size: 24px;
        }
        
        .titre {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .titre-en {
            font-size: 11px;
            font-style: italic;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            font-size: 150px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
        }
        
        .content {
            position: relative;
            z-index: 2;
        }
        
        .ligne {
            margin-bottom: 12px;
            display: flex;
            align-items: baseline;
            font-size: 11px;
        }
        
        .label {
            font-weight: bold;
            min-width: 180px;
        }
        
        .label-en {
            font-style: italic;
            font-size: 9px;
            display: block;
            font-weight: normal;
        }
        
        .dots {
            border-bottom: 1px dotted #000;
            flex: 1;
            min-height: 18px;
            padding-left: 5px;
        }
        
        .date-naissance {
            display: inline-flex;
            gap: 20px;
        }
        
        .date-box {
            border-bottom: 1px dotted #000;
            min-width: 60px;
            text-align: center;
            padding: 0 5px;
        }
        
        .motif-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
        }
        
        .checkbox-group {
            display: flex;
            gap: 30px;
            margin-top: 5px;
            flex-wrap: wrap;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .checkbox {
            width: 15px;
            height: 15px;
            border: 2px solid #000;
            display: inline-block;
        }
        
        .checkbox.checked::after {
            content: '✓';
            font-weight: bold;
            font-size: 14px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .carte {
                box-shadow: none;
                margin: 0;
                padding: 10mm;
            }
        }
    </style>
</head>
<body>
    <div class="carte">
        <div class="watermark">BURKINA FASO</div>
        
        <div class="content">
            <div class="header">
                <div class="flag">
                    <div class="flag-red">
                        <span class="star">★</span>
                    </div>
                    <div class="flag-green"></div>
                </div>
                <div class="titre">
                    CARTE INTERNATIONALE D'EMBARQUEMENT / DÉBARQUEMENT
                </div>
                <div class="titre-en">
                    INTERNATIONAL EMBARCATION / DISEMBARKATION CARD
                </div>
            </div>
            
            <div class="ligne">
                <span class="label">DATE :</span>
                <span class="dots">${voyage.dateVoyage || ''}</span>
                <span class="label" style="margin-left: 20px;">VOL N° / FLIGHT N° :</span>
                <span class="dots">${voyage.vol.numero || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">
                    Nom :<span class="label-en">Name (en caractère d'imprimerie / please print)</span>
                </span>
                <span class="dots">${voyage.nomVoyageur || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Prénoms :<span class="label-en">Given names</span></span>
                <span class="dots">${voyage.prenomVoyageur|| ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Nom de jeune fille :<span class="label-en">Maiden name</span></span>
                <span class="dots"></span>
            </div>
            
            <div class="ligne">
                <span class="label">Date de naissance :<span class="label-en">Date of birth</span></span>
                <div class="date-naissance">
                    <span class="date-box">${jour}</span> Jour/Day
                    <span class="date-box">${mois}</span> Mois/Month
                    <span class="date-box">${annee}</span> Année/Year
                </div>
            </div>
            
            <div class="ligne">
                <span class="label">Lieu de naissance :<span class="label-en">Place of birth</span></span>
                <span class="dots">${voyage.lieuNaissance || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Nationalité :<span class="label-en">Nationality</span></span>
                <span class="dots">${voyage.nationalite || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Profession :</span>
                <span class="dots">${voyage.profession || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Fonction :<span class="label-en">Function</span></span>
                <span class="dots"></span>
            </div>
            
            <div class="ligne">
                <span class="label">Adresse à l'étranger :<span class="label-en">Adress abroad</span></span>
                <span class="dots">${voyage.adresseEtranger || ''}</span>
                <span style="margin-left: 10px;">Tél :</span>
                <span class="dots" style="min-width: 100px;">${voyage.telephoneEtranger || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Adresse au Burkina Faso :<span class="label-en">Adress in Burkina Faso</span></span>
                <span class="dots">${voyage.adresseBurkina || ''}</span>
                <span style="margin-left: 10px;">Tél :</span>
                <span class="dots" style="min-width: 100px;">${voyage.telephoneBurkina || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Pays de résidence :<span class="label-en">Country of permanent residence</span></span>
                <span class="dots">${voyage.paysResidence || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Venant de :<span class="label-en">Coming from</span></span>
                <span class="dots">${voyage.aeroportDepart || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Allant à :<span class="label-en">Going to</span></span>
                <span class="dots">${voyage.aeroportDestination || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Passeport N° :<span class="label-en">Passport N°</span></span>
                <span class="dots">${voyage.numeroDocument || ''}</span>
            </div>
            
            <div class="ligne">
                <span class="label">Date et lieu de délivrance :<span class="label-en">Date and place of issue</span></span>
                <span class="dots">${voyage.dateDelivrance || ''} - ${voyage.lieuDelivrance || ''}</span>
            </div>
            
            <div class="motif-section">
                <div class="ligne">
                    <span class="label" style="font-size: 12px;">Motif du voyage / Purpose of travel :</span>
                </div>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <span class="checkbox ${motifAffaire}"></span>
                        <span>Conférence / Affaires<br><i style="font-size: 9px;">Conference / Business</i></span>
                    </div>
                    <div class="checkbox-item">
                        <span class="checkbox ${motifFamille}"></span>
                        <span>Vacances / Famille<br><i style="font-size: 9px;">Holidays / Family</i></span>
                    </div>
                    <div class="checkbox-item">
                        <span class="checkbox ${motifEtude}"></span>
                        <span>Études<br><i style="font-size: 9px;">Studies</i></span>
                    </div>
                    <div class="checkbox-item">
                        <span class="checkbox ${motifAutre}"></span>
                        <span>Autre / Other (À préciser)</span>
                    </div>
                </div>
            </div>
            
            <div class="ligne" style="margin-top: 15px;">
                <span class="label">Durée du séjour :<span class="label-en">Length of the staying</span></span>
                <span class="dots">${voyage.dureeSejour || ''} jour(s)</span>
            </div>
        </div>
    </div>
</body>
</html>`;
}


}