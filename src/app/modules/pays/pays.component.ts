import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import * as paysAction from '../../store/pays/action';
import * as paysSelector from '../../store/pays/selector';
import { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { StatusEnum } from 'src/app/store/global-config/model';
import * as globalSelector from '../../store/global-config/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { Pays } from 'src/app/store/pays/model';


@Component({
    selector: 'app-pays',
    standalone: true,
    imports: [CommonModule,
        TableModule,LoadingSpinnerComponent,
        ButtonModule, RippleModule, TooltipModule, ToolbarModule, ToastModule, InputTextModule, FormsValidationComponent,
        ReactiveFormsModule, SplitButtonModule, PaginatorModule, DialogModule, ConfirmDialogModule,],
    providers: [MessageService, ConfirmationService],
    templateUrl: './pays.component.html',
    styleUrl: './pays.component.scss'
})
export class PaysComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<boolean>();
  paysList$!: Observable<Array<Pays>>;
  paysList: Array<Pays> = [];
  selectedPays: Pays = {};
  cols: any[] = [];
  pays: Pays = {};
  payss: Pays[] = [] ;
  paysDialog = false;
  paysFormGroup!: FormGroup;
  popupHeader = 'Enregistrer un pays';
  isUpdate = false;
  loading = true;

    constructor(private fb: FormBuilder,
        private store: Store<AppState>, private messageService: MessageService,
        private confirmationService: ConfirmationService) {

    }

    ngOnInit(): void {
        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'nom', header: 'Pays' },
        ]
       
        this.createFormPays();
        this.paysList$ = this.store.pipe(select(paysSelector.paysList));
        this.store.dispatch(paysAction.loadPays());
        this.paysList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {

                if (value) {
                    this.loading = false;
                    this.payss = value;
                }
            });


        this.store.pipe(
            select(globalSelector.status),
            takeUntil(this.destroy$)
        ).subscribe(status => {
            if (status && status.message) {
                this.showToast(status.status, status.message);
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

  

    onRowSelect($event: any) {
        console.log($event.data);
    }

    createFormPays() {
        this.paysFormGroup = this.fb.group({
            id: this.fb.control('', []),
            code: this.fb.control('', [Validators.required,]),
            nom: this.fb.control('', [Validators.required, Validators.minLength(2)]),
        })
    }


    handleActionsClick(pays: Pays): void {
        this.selectedPays = pays;
    }


    openNew() {
        this.paysDialog = true;
    }
    addPays() {
        this.pays = {};
        this.paysDialog = true;
    }

    update(form: Pays) {
        this.popupHeader = 'Modifier un pays';
        this.paysFormGroup.patchValue({
            id: form.id,
            code: form.code,
            nom: form.nom,
        });
        this.paysDialog = true;
        this.isUpdate = true;
    }

 onGlobalFilter(table: any, event: Event) {
    const input = (event.target as HTMLInputElement).value;
    table.filterGlobal(input, 'contains');
  }
    onSave() {
        const toSave: Pays = this.paysFormGroup.value;
        console.log("===============profilFormGroup=====================", this.paysFormGroup.value)

        this.confirmationService.confirm({
            message: 'Etes vous sur de vouloir ajouter ce pays?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',  // Bouton "Yes" en rouge
            rejectButtonStyleClass: 'p-button-secondary', // Bouton "No" en gris
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (toSave.id) {
                    this.store.dispatch(paysAction.updatePays(toSave));

                } else {
                    this.store.dispatch(paysAction.createPays(toSave));

                }
                this.paysFormGroup.reset();
            }
        });
        this.paysDialog = false;
    }

    deletePays(pays: Pays) {
        this.store.dispatch(paysAction.deletePays(pays));
    }

    cancel() {
        this.paysFormGroup.reset();
        this.paysDialog = false;
        this.isUpdate = false;
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        // Now let's also unsubscribe from the subject itself:
        this.destroy$.unsubscribe();
    }
}
