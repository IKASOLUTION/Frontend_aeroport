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
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as aeroportAction from '../../store/aeroport/action';
import * as villeAction from '../../store/ville/action';
import * as aeroportSelector from '../../store/aeroport/selector';
import * as villeSelector from '../../store/ville/selector';
import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum, StatutAeroport } from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { Aeroport } from 'src/app/store/aeroport/model';
import { Ville } from 'src/app/store/ville/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    selector: 'app-aeroport',
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
        SplitButtonModule, 
        PaginatorModule, 
        DialogModule, 
        FieldsetModule ,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './aeroport.component.html',
    styleUrl: './aeroport.component.scss'
})
export class AeroportComponent implements OnInit, OnDestroy {
    countries: any[] = [];
    destroy$ = new Subject<boolean>();
    aeroportList$!: Observable<Array<Aeroport>>;
    aeroportList: Array<Aeroport> = [];
    aeroport: Aeroport = {};
    villes: Ville[] = [];
    aeroports: Aeroport[] = [];
    villeList$!: Observable<Array<Ville>>;
    villeList: Array<Ville> = [];
    
    cols: any[] = [];
    selectedAeroport: Aeroport = {};
    selectedCountry: any;
    
    keyword = '';
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 5;
    aeroportDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    aeroportFormGroup!: FormGroup;
    popupHeader = 'Enregistrer un aéroport';

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>, 
        private messageService: MessageService,
        private countryService: CountryService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        // Charger les pays depuis le fichier JSON
        this.countryService.getCountries().then((countries) => {
            this.countries = countries;
        });
        
        // Définir les colonnes du tableau
        this.cols = [
            { field: 'nomAeroport', header: 'Nom de l\'aéroport' },
            { field: 'code_oaci', header: 'Code OACI' },
            { field: 'typeAeroport', header: 'Type' },
            { field: 'ville.nom', header: 'Ville' },
            { field: 'pays', header: 'Pays' },
            { field: 'statutAeroport', header: 'Statut' }
        ];
        
        this.createFormSearch();
        this.createFormAeroport();
        
        // Charger les aéroports
        this.aeroportList$ = this.store.pipe(select(aeroportSelector.aeroportList));
        this.store.dispatch(aeroportAction.loadAeroport());
        
        this.aeroportList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.loading = false;
                    this.aeroports = [...value];
                    console.log('=== Aéroports reçus ===', value);
                }
            });

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

        // Écouter les statuts (success, error, warning)
        this.store.pipe(
            select(globalSelector.status),
            takeUntil(this.destroy$)
        ).subscribe(status => {
            if (status && status.message) {
                this.showToast(status.status, status.message);
                
                // Recharger après une opération réussie
                if (status.status === StatusEnum.success) {
                    this.store.dispatch(aeroportAction.loadAeroport());
                }
            }
        });
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
            keyword: [null],
        });
    }

    createFormAeroport() {
        this.aeroportFormGroup = this.fb.group({
            id: this.fb.control(null),
            nomAeroport: this.fb.control('', [Validators.required, Validators.minLength(2)]),
            code_oaci: this.fb.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
            typeAeroport: this.fb.control('', [Validators.required]),
            ville: this.fb.control(null, [Validators.required]),
            adresse: this.fb.control(''),
            latitude: this.fb.control(null),
            longitude: this.fb.control(null),
            telephone: this.fb.control(''),
            mailResponsable: this.fb.control('', [Validators.email]),
            siteWeb: this.fb.control(''),
            nomResponsable: this.fb.control(''),
            prenomResponsable: this.fb.control(''),
            telephoneResponsable: this.fb.control(''),
            statutAeroport: this.fb.control(StatutAeroport.ACTIF, [Validators.required])
        });
    }

    findPays(country: any) {
        if (country && country.name) {
            this.aeroport.pays = country.name;
        }
    }

    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    openNew() {
        this.aeroport = {};
        this.selectedCountry = null;
        this.aeroportFormGroup.reset();
        this.aeroportFormGroup.patchValue({ statutAeroport: StatutAeroport.ACTIF });
        this.popupHeader = 'Enregistrer un aéroport';
        this.isUpdate = false;
        this.aeroportDialog = true;
    }

    update(form: Aeroport) {
        this.popupHeader = 'Modifier un aéroport';
        
        // Retrouver l'objet pays complet
        this.selectedCountry = form.pays ? 
            this.countries.find(c => c.name === form.pays) : 
            null;
        
        this.aeroportFormGroup.patchValue({
            id: form.id,
            nomAeroport: form.nomAeroport,
            code_oaci: form.code_oaci,
            typeAeroport: form.typeAeroport,
            ville: form.ville,
            adresse: form.adresse,
            latitude: form.latitude,
            longitude: form.longitude,
            telephone: form.telephone,
            mailResponsable: form.mailResponsable,
            siteWeb: form.siteWeb,
            nomResponsable: form.nomResponsable,
            prenomResponsable: form.prenomResponsable,
            telephoneResponsable: form.telephoneResponsable,
            statutAeroport: form.statutAeroport
        });
        
        this.aeroport = { ...form };
        this.aeroportDialog = true;
        this.isUpdate = true;
    }

    onSave() {
        if (this.aeroportFormGroup.invalid || !this.selectedCountry) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires',
                life: 3000
            });
            return;
        }

        const formValue = this.aeroportFormGroup.value;
        
        // Créez un objet propre avec tous les nouveaux champs
        const aeroportToSave: Aeroport = {
            nomAeroport: formValue.nomAeroport?.trim(),
            code_oaci: formValue.code_oaci?.trim().toUpperCase(),
            typeAeroport: formValue.typeAeroport?.trim(),
            villeId: formValue.ville?.id,
            pays: this.selectedCountry?.name,
            adresse: formValue.adresse?.trim() || undefined,
            longitude: formValue.longitude || undefined,
            latitude: formValue.latitude || undefined,
            telephone: formValue.telephone?.trim() || undefined,
            mailResponsable: formValue.mailResponsable?.trim() || undefined,
            siteWeb: formValue.siteWeb?.trim() || undefined,
            nomResponsable: formValue.nomResponsable?.trim() || undefined,
            prenomResponsable: formValue.prenomResponsable?.trim() || undefined,
            telephoneResponsable: formValue.telephoneResponsable?.trim() || undefined,
            statutAeroport: formValue.statutAeroport
        };
        
        // Ajoutez l'ID si c'est une mise à jour
        if (this.isUpdate && formValue.id) {
            aeroportToSave.id = formValue.id;
        }
        
        console.log("===== COMPOSANT - Objet à dispatcher =====", aeroportToSave);

        this.confirmationService.confirm({
            message: this.isUpdate ? 
                'Êtes-vous sûr de vouloir modifier cet aéroport?' : 
                'Êtes-vous sûr de vouloir ajouter cet aéroport?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (this.isUpdate) {
                    this.store.dispatch(aeroportAction.updateAeroport(aeroportToSave));
                } else {
                    this.store.dispatch(aeroportAction.createAeroport(aeroportToSave));
                }
                
                this.resetForm();
            }
        });
    }

    private resetForm(): void {
        this.aeroportFormGroup.reset();
        this.selectedCountry = null;
        this.aeroport = {};
        this.aeroportDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un aéroport';
    }

    confirmDelete(aeroport: Aeroport) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'aéroport "${aeroport.nomAeroport}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteAeroport(aeroport);
            }
        });
    }

    deleteAeroport(aeroport: Aeroport) {
        this.store.dispatch(aeroportAction.deleteAeroport(aeroport));
    }

    confirmChangeStatus(aeroport: Aeroport) {
        const newStatus: StatutAeroport = aeroport.statutAeroport === StatutAeroport.ACTIF ? 
            StatutAeroport.INACTIF : 
            StatutAeroport.ACTIF;
        const action = newStatus === StatutAeroport.ACTIF ? 'activer' : 'désactiver';
        
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir ${action} l'aéroport "${aeroport.nomAeroport}" ?`,
            header: 'Confirmation de changement de statut',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: aeroport.statutAeroport === StatutAeroport.ACTIF ? 
                'p-button-warning' : 
                'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, ' + action,
            rejectLabel: 'Annuler',
            accept: () => {
                const updatedAeroport: Aeroport = { 
                    ...aeroport, 
                    statutAeroport: newStatus 
                };
                this.store.dispatch(aeroportAction.changerStatusAeroport(updatedAeroport));
            }
        });
    }

    cancel() {
        this.aeroportFormGroup.reset();
        this.selectedCountry = null;
        this.aeroport = {};
        this.aeroportDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un aéroport';
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}