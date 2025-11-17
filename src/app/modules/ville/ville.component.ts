import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { SplitButtonModule } from 'primeng/splitbutton';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, Subject, takeUntil } from 'rxjs';
import { provideStore, select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';

import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum } from 'src/app/store/global-config/model';
import * as villeSelector from '../../store/ville/selector';
import * as villeAction from '../../store/ville/action';

import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { Ville } from 'src/app/store/ville/model';
import { CountryService } from 'src/app/demo/service/country.service';


@Component({
    selector: 'app-Ville',
    standalone: true,
    imports: [CommonModule,
        TableModule,LoadingSpinnerComponent,FormsModule,
        ButtonModule, RippleModule, TooltipModule, ToolbarModule, ToastModule, InputTextModule, FormsValidationComponent,
        ReactiveFormsModule, SplitButtonModule, PaginatorModule, DialogModule, ConfirmDialogModule,],
    providers: [MessageService, ConfirmationService],
    templateUrl: './Ville.component.html',
    styleUrl: './Ville.component.scss'
})
export class VilleComponent implements OnInit, OnDestroy {
    countries: any[] = [];
    destroy$ = new Subject<boolean>();
    villeList$!: Observable<Array<Ville>>;
    villeList!: Array<Ville>;
    villes: Ville[] = [];
    ville: Ville = {};
    cols: any[] = [];
    selectedVille: Ville = {};
    keyword = '';
    clientCriteria!: Ville;
    enableFilter = false;
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 5;
    villeDialog: boolean = false;
    loading: boolean = true;
    isUpdate = false;
    items: MenuItem[] = [];
    villeFormGroup!: FormGroup;
    selectedCountry: any;
    popupHeader = 'Enregistrer une Ville';


    constructor(private fb: FormBuilder,
        private store: Store<AppState>, private messageService: MessageService,
         private countryService: CountryService,
        private confirmationService: ConfirmationService) {

    }



    ngOnInit(): void {
         this.countryService.getCountries().then((countries) => {
            this.countries = countries;
        });
        this.cols = [
            { field: 'nom', header: 'Nom' },
            { field: 'pays', header: 'Pays' },
        ]
        this.createFormSearch();
        this.createFormVille();
        this.villeList$ = this.store.pipe(select(villeSelector.villeList));
        this.store.dispatch(villeAction.loadVille());
        this.villeList$.pipe(takeUntil(this.destroy$))
        .subscribe(value => {
            console.log('=== Données reçues du store ===', value); // ← Pour déboguer
            if (value) {
                this.loading = false;
                this.villes = [...value]; 
            }
        });


        this.store.pipe(
        select(globalSelector.status),
        takeUntil(this.destroy$)
    ).subscribe(status => {
        if (status && status.message) {
            this.showToast(status.status, status.message);
            
            // ← Rechargez la liste après une opération réussie
            if (status.status === StatusEnum.success) {
                this.store.dispatch(villeAction.loadVille());
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

    onEnableFilter() {
        this.enableFilter = !this.enableFilter;
    }

    onRowSelect($event: any) {
        console.log($event.data);
    }


    createFormSearch(): void {
        this.formSearch = this.fb.group({
            keyword: [null],
        });
    }

    createFormVille() {
        this.villeFormGroup = this.fb.group({
            id: this.fb.control('', []),
            nom: this.fb.control('', [Validators.required, Validators.minLength(2)]),
        })
    }

     findPays(country: any) {
        if (country && country.name) {
            this.ville.pays = country.name;
        }
    }


    handleActionsClick(Ville: Ville): void {
        this.selectedVille = Ville;
    }


    onPageChange(event: any) {
        this.first = event.first;
        this.page = event.page;
        this.itemsPerPage = event.rows;
        this.rows = event.rows;
       
    }



    onResetForm() {
        this.formSearch.reset();
       
    }

    openNew() {
        this.villeDialog = true;

    }
      addVille() {
        this.ville = {};
        this.villeDialog = true;
    }

update(form: Ville) {
    this.popupHeader = 'Modifier une Ville';
    
    // Retrouver l'objet pays complet
    this.selectedCountry = form.pays ? 
        this.countries.find(c => c.name === form.pays) : 
        null;
    
    this.villeFormGroup.patchValue({
        id: form.id,
        nom: form.nom
    });
    
    this.ville = { ...form }; // Pour avoir l'objet complet avec l'ID
    this.villeDialog = true;
    this.isUpdate = true;
}



    onSave() {
        const formValue = this.villeFormGroup.value;
        
        // Combinez les valeurs du form et le pays sélectionné
        const toSave: Ville = {
            id: formValue.id,
            nom: formValue.nom,
            pays: this.ville.pays // Le pays a été mis à jour par findPays()
        };

         if (this.isUpdate && formValue.id) {
        toSave.id = formValue.id;
       }
    
    console.log("Final object to save:", toSave);
    console.log("Has ID?", !!toSave.id);
        
        console.log("===============Ville à sauvegarder=====================", toSave);

        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir ajouter cette ville?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                 if (this.isUpdate && toSave.id) {
                    this.store.dispatch(villeAction.updateVille({ ville: toSave }));
                } else {
                    this.store.dispatch(villeAction.createVille(toSave));
                }
                this.villeFormGroup.reset();
                this.selectedCountry = null; // Réinitialisez aussi le pays
                this.ville = {};
                this.villeDialog = false;
                this.isUpdate = false;
            }
        });
    }


    deleteVille(ville: Ville) {

        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer cette ville?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                console.log("Ville à supprimer:", ville);
                if ( ville.id){
                    this.store.dispatch(villeAction.deleteVille(ville));
                } 
               
            }
        });
               
    }
     onGlobalFilter(table: any, event: Event) {
    const input = (event.target as HTMLInputElement).value;
    table.filterGlobal(input, 'contains');
  }

  cancel() {
        this.villeFormGroup.reset();
        this.selectedCountry = null;
        this.ville = {};
        this.villeDialog = false;
        this.isUpdate = false;
        this.popupHeader = 'Enregistrer une Ville';
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        // Now let's also unsubscribe from the subject itself:
        this.destroy$.unsubscribe();
    }
}
