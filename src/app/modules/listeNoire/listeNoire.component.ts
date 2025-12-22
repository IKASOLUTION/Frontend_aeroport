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
import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum, Statut} from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { Ville } from 'src/app/store/ville/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { FieldsetModule } from 'primeng/fieldset';
import { ListeNoire } from 'src/app/store/listeNoir/model';
import * as listeNoireAction from '../../store/listeNoir/action';
import * as listeNoireSelector from '../../store/listeNoir/selector';
import { TagModule } from 'primeng/tag';



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
        ConfirmDialogModule,
        TagModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './listeNoire.component.html',
    styleUrl: './listeNoire.component.scss'
})
export class ListeNoireComponent implements OnInit, OnDestroy {
    countries: any[] = [];
    destroy$ = new Subject<boolean>();
    listeNoireList$!: Observable<Array<ListeNoire>>;
    listeNoireList: Array<ListeNoire> = [];
    listeNoire: ListeNoire = {};
    villes: Ville[] = [];
    listeNoires: ListeNoire[] = [];
  
    
    cols: any[] = [];
    selectedListeNoire: ListeNoire = {};
    selectedCountry: any;
    
    keyword = '';
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 5;
    listeNoireDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    listeNoireFormGroup!: FormGroup;
    popupHeader = 'Enregistrer une personne dans la liste noire';

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
  { field: 'nom', header: 'Nom complet' },
  { field: 'prenom', header: 'Prénom' },
  { field: 'dateNaissance', header: 'Date de naissance' },
  { field: 'lieuNaissance', header: 'Lieu de naissance' },
  { field: 'motif', header: 'Motif' },
  { field: 'numeroNip', header: 'Numéro NIP' },
  { field: 'numeroCnib', header: 'Numéro CNIB' },
  { field: 'statut', header: 'Statut' },
];
        
       
           this.createFormListeNoire();
       
           this.store.dispatch(listeNoireAction.loadListeNoire());
           this.store.pipe(select(listeNoireSelector.listeNoireList), takeUntil(this.destroy$)).subscribe(data => {
             this.listeNoires = data || [];
             this.loading = false;
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
                    this.store.dispatch(listeNoireAction.loadListeNoire());
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

  createFormListeNoire() {
  this.listeNoireFormGroup = this.fb.group({
    id: this.fb.control(null),
    nom: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    prenom: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    dateNaissance: this.fb.control('', [Validators.required]),
    lieuNaissance: this.fb.control('', [Validators.required]),
    motif: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    numeroNip: this.fb.control('', [Validators.pattern('^[0-9]*$')]),
    numeroCnib: this.fb.control('', [Validators.pattern('^[A-Za-z0-9]*$')]),
    statut: this.fb.control(Statut.ACTIF, [Validators.required])
  });
}

   

    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    openNew() {
        this.listeNoire = {};
        this.listeNoireFormGroup.reset();
        this.listeNoireFormGroup.patchValue({ Statut: Statut.ACTIF });
        this.popupHeader = 'Enregistrer une personne';
        this.isUpdate = false;
        this.listeNoireDialog = true;
    }

   update(form: ListeNoire) {
  this.popupHeader = 'Modifier une personne dans la liste noire';

  this.listeNoireFormGroup.patchValue({
    id: form.id,
    nom: form.nom,
    prenom: form.prenom,
    dateNaissance: form.dateNaissance,
    lieuNaissance: form.lieuNaissance,
    motif: form.motif,
    numeroNip: form.numeroNip,
    numeroCnib: form.numeroCnib,
    statut: form.statut
  });

  this.listeNoire = { ...form };
  this.listeNoireDialog = true;
  this.isUpdate = true;
}


    onSave() {
        if (this.listeNoireFormGroup.invalid ) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires',
                life: 3000
            });
            return;
        }

        const formValue = this.listeNoireFormGroup.value;
        
        // Créez un objet propre avec tous les nouveaux champs
            const personneToSave: ListeNoire = {
            id: formValue.id,
            nom: formValue.nom?.trim(),
            prenom: formValue.prenom?.trim(),
            dateNaissance: formValue.dateNaissance || undefined,
            lieuNaissance: formValue.lieuNaissance?.trim() || undefined,
            motif: formValue.motif?.trim() || undefined,
            numeroNip: formValue.numeroNip?.trim() || undefined,
            numeroCnib: formValue.numeroCnib?.trim() || undefined,
            statut: formValue.statut
        };
        // Ajoutez l'ID si c'est une mise à jour
        if (this.isUpdate && formValue.id) {
            personneToSave.id = formValue.id;
        }
        
        console.log("===== COMPOSANT - Objet à dispatcher =====", personneToSave);

        this.confirmationService.confirm({
            message: this.isUpdate ? 
                'Êtes-vous sûr de vouloir modifier cette personne?' : 
                'Êtes-vous sûr de vouloir ajouter cet personne?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (this.isUpdate) {
                    this.store.dispatch(listeNoireAction.updateListeNoire(personneToSave));
                } else {
                    this.store.dispatch(listeNoireAction.createListeNoire(personneToSave));
                }
                
                this.resetForm();
            }
        });
    }

    private resetForm(): void {
        this.listeNoireFormGroup.reset();
        this.listeNoire = {};
        this.listeNoireDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer une personne';
    }


     confirmDelete(listeNoire: ListeNoire) {
        this.confirmationService.confirm({
          message: `Êtes-vous sûr de vouloir supprimer  "${listeNoire.nom}" ?`,
          header: 'Confirmation de suppression',
          icon: 'pi pi-exclamation-triangle',
          acceptButtonStyleClass: 'p-button-danger',
          rejectButtonStyleClass: 'p-button-secondary',
          acceptLabel: 'Oui, supprimer',
          rejectLabel: 'Annuler',
          accept: () => this.store.dispatch(listeNoireAction.deleteListeNoire(listeNoire))
        });
      }

   
getStatutSeverity(statut: string | Statut): 'success' | 'danger' | 'secondary' | 'info' | 'warning' | 'contrast' {
    const statutStr = typeof statut === 'string' ? statut : statut;
    
    switch(statutStr?.toUpperCase()) {
        case Statut.ACTIF:
        case 'ACTIF':
            return 'danger';      // Rouge - Personne activement sur liste noire ⛔
            
        case Statut.LEVEE:
        case 'LEVEE':
        case 'LEVÉE':
            return 'success';     // Vert - Mesure levée ✅
            
        case Statut.SUSPENDU:
        case 'SUSPENDU':
            return 'warning';     // Orange - Temporairement suspendu ⚠️
            
        case Statut.INACTIF:
        case 'INACTIF':
            return 'secondary';   // Gris - Inactif 🔘
            
        default:
            return 'secondary';
    }
}
    confirmChangeStatusListeNoire(listeNoire: ListeNoire) {
        const newStatus: Statut = listeNoire.statut === Statut.ACTIF ? 
            Statut.LEVEE : 
            Statut.ACTIF;
        const action = newStatus === Statut.ACTIF ? 'actif' : 'levée';
        
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir ${action} de  "${listeNoire.nom}" ?`,
            header: 'Confirmation de changement de statut',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: listeNoire.statut === Statut.ACTIF ? 
                'p-button-warning' : 
                'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, ' + action,
            rejectLabel: 'Annuler',
            accept: () => {
                const updatedlisteNoire: ListeNoire = { 
                    ...listeNoire, 
                    statut: newStatus 
                };
                this.store.dispatch(listeNoireAction.changerStatusListeNoire(updatedlisteNoire));
            }
        });
    }

    cancel() {
        this.listeNoireFormGroup.reset();
        this.listeNoire = {};
        this.listeNoireDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer une personne';
    }

    ngOnDestroy() { 
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}