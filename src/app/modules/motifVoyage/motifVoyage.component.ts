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
import * as motifVoyageAction from '../../store/motifVoyage/action';
import * as motifVoyageSelector from '../../store/motifVoyage/selector';
import { MotifVoyage } from 'src/app/store/motifVoyage/model';



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
    templateUrl: './motifVoyage.component.html',
    styleUrl: './motifVoyage.component.scss'
})
export class MotifVoyageComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<boolean>();
    motifVoyageList$!: Observable<Array<MotifVoyage>>;
    motifVoyageList: Array<MotifVoyage> = [];
    motifVoyage: MotifVoyage = {};
    motifVoyages: MotifVoyage[] = [];
  
    
    cols: any[] = [];
    selectedMotifVoyage: MotifVoyage = {};
    keyword = '';
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 5;
    motifVoyageDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    motifVoyageFormGroup!: FormGroup;
    popupHeader = 'Enregistrer un motif de voyage';
    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>, 
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
     
        // Définir les colonnes du tableau
       this.cols = [
  { field: 'code', header: 'Nom du motf' },
  { field: 'libelle', header: 'Description' },
];
        
       
           this.createFormMotifVoyage();
       
           this.store.dispatch(motifVoyageAction.loadMotifVoyage());
           this.store.pipe(select(motifVoyageSelector.motifVoyageList), takeUntil(this.destroy$)).subscribe(data => {
             this.motifVoyages = data || [];
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
                    this.store.dispatch(motifVoyageAction.loadMotifVoyage());
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

  createFormMotifVoyage() {
  this.motifVoyageFormGroup = this.fb.group({
    id: this.fb.control(null),
    code: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    libelle: this.fb.control('')
   
  });
}

   

    onGlobalFilter(table: any, event: Event) {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    openNew() {
        this.motifVoyage = {};
        this.motifVoyageFormGroup.reset();
        this.popupHeader = 'Enregistrer un motif de voyage';
        this.isUpdate = false;
        this.motifVoyageDialog = true;
    }

   update(form: MotifVoyage) {
  this.popupHeader = 'Modifier un motif de voyage';

  this.motifVoyageFormGroup.patchValue({
    id: form.id,
    code: form.code,
    libelle: form.libelle,
  });

  this.motifVoyage = { ...form };
  this.motifVoyageDialog = true;
  this.isUpdate = true;
}


    onSave() {
        if (this.motifVoyageFormGroup.invalid ) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires',
                life: 3000
            });
            return;
        }

        const formValue = this.motifVoyageFormGroup.value;
        
        // Créez un objet propre avec tous les nouveaux champs
            const personneToSave: MotifVoyage = {
            id: formValue.id,
            code: formValue.code?.trim(),
            libelle: formValue.libelle?.trim(),
        };
        // Ajoutez l'ID si c'est une mise à jour
        if (this.isUpdate && formValue.id) {
            personneToSave.id = formValue.id;
        }
        
        console.log("===== COMPOSANT - Objet à dispatcher =====", personneToSave);

        this.confirmationService.confirm({
            message: this.isUpdate ? 
                'Êtes-vous sûr de vouloir modifier ce motif de voyage?' : 
                'Êtes-vous sûr de vouloir ajouter cet motif de voyage?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (this.isUpdate) {
                    this.store.dispatch(motifVoyageAction.updateMotifVoyage(personneToSave));
                } else {
                    this.store.dispatch(motifVoyageAction.createMotifVoyage(personneToSave));
                }
                
                this.resetForm();
            }
        });
    }

    private resetForm(): void {
        this.motifVoyageFormGroup.reset();
        this.motifVoyage= {};
        this.motifVoyageDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un motif de voyage';
    }

    confirmDelete(motifVoyage: MotifVoyage) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer ce motif de voyage "${motifVoyage.code}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteMotifVoyage(motifVoyage);
            }
        });
    }

    deleteMotifVoyage(motifVoyage: MotifVoyage) {
        this.store.dispatch(motifVoyageAction.deleteMotifVoyage(motifVoyage));
    }

   

    cancel() {
        this.motifVoyageFormGroup.reset();
        this.motifVoyage = {};
        this.motifVoyageDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer un motif de voyage';
    }

    ngOnDestroy() { 
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}