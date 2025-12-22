import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as compagnieAction from '../../store/compagnie/action';
import * as compagnieSelector from '../../store/compagnie/selector';
import * as globalSelector from '../../store/global-config/selector';
import { Compagnie } from 'src/app/store/compagnie/model';
import { StatusEnum, Statut } from 'src/app/store/global-config/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-compagnie',
  standalone: true,
  templateUrl: './compagnie.component.html',
  styleUrls: ['./compagnie.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    ToastModule,
    InputTextModule,
    InputTextareaModule,
    FieldsetModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class CompagnieComponent implements OnInit, OnDestroy {
  countries: any[] = [];
  compagnies: Compagnie[] = [];
  selectedCompagnie: Compagnie = {};
  compagnieForm!: FormGroup;
  compagnieDialog = false;
  popupHeader = 'Nouvelle Compagnie';
  isUpdate = false;
  loading = true;
  destroy$ = new Subject<boolean>();
  cols: any[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private messageService: MessageService,
    private countryService: CountryService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.countryService.getCountries().then(countries => (this.countries = countries));

    // Définir les colonnes du tableau
    this.cols = [
      { field: 'nomCompagine', header: 'Nom de la compagnie' },
      { field: 'groupe', header: 'Groupe' },
      { field: 'pays', header: 'Pays' },
      { field: 'statut', header: 'Statut' }
    ];

    this.createFormCompagnie();

    this.store.dispatch(compagnieAction.loadCompagnie());
    this.store.pipe(select(compagnieSelector.compagnieList), takeUntil(this.destroy$)).subscribe(data => {
      this.compagnies = data || [];
      this.loading = false;
    });

    this.store.pipe(select(globalSelector.status), takeUntil(this.destroy$)).subscribe(status => {
      if (status && status.message) this.showToast(status.status, status.message);
    });
  }

  private showToast(status: StatusEnum, message: string): void {
    this.messageService.clear();
    const msg = {
      severity: status === StatusEnum.success ? 'success' : status === StatusEnum.warning ? 'warn' : 'error',
      summary:
        status === StatusEnum.success
          ? 'Succès'
          : status === StatusEnum.warning
          ? 'Attention'
          : 'Erreur',
      detail: message,
      life: 4000
    };
    this.messageService.add(msg);
  }

  createFormCompagnie() {
    this.compagnieForm = this.fb.group({
      id: [null],
      nomCompagine: ['', [Validators.required, Validators.minLength(2)]],
      groupe: [''],
      siege: [''],
      adresseSiege: [''],
      contact: [''],
      email: ['', [Validators.email]],
      pays: ['', [Validators.required]],
      nomResponsable: [''],
      prenomResponsable: [''],
      nationaliteResponsable: [''],
      telephoneResponsable: [''],
      mailResponsable: ['', [Validators.email]],
      statut: [Statut.ACTIF, [Validators.required]]
    });
  }

  openNew() {
    this.compagnieForm.reset();
    this.compagnieForm.patchValue({ statut: Statut.ACTIF });
    this.isUpdate = false;
    this.popupHeader = 'Nouvelle Compagnie';
    this.compagnieDialog = true;
  }

  update(compagnie: Compagnie) {
    this.compagnieForm.patchValue({
      id: compagnie.id,
      nomCompagine: compagnie.nomCompagine,
      groupe: compagnie.groupe,
      siege: compagnie.siege,
      adresseSiege: compagnie.adresseSiege,
      contact: compagnie.contact,
      email: compagnie.email,
      pays: compagnie.pays,
      nomResponsable: compagnie.nomResponsable,
      prenomResponsable: compagnie.prenomResponsable,
      nationaliteResponsable: compagnie.nationaliteResponsable,
      telephoneResponsable: compagnie.telephoneResponsable,
      mailResponsable: compagnie.mailResponsable,
      statut: compagnie.statut
    });
    this.isUpdate = true;
    this.popupHeader = 'Modifier une Compagnie';
    this.compagnieDialog = true;
  }

  onSave() {
    if (this.compagnieForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires.',
        life: 3000
      });
      return;
    }

    const formValue = this.compagnieForm.value;
    
    // Créer un objet propre
    const compagnieToSave: Compagnie = {
      nomCompagine: formValue.nomCompagine?.trim(),
      groupe: formValue.groupe?.trim() || undefined,
      siege: formValue.siege?.trim() || undefined,
      adresseSiege: formValue.adresseSiege?.trim() || undefined,
      contact: formValue.contact?.trim() || undefined,
      email: formValue.email?.trim() || undefined,
      pays: formValue.pays,
      nomResponsable: formValue.nomResponsable?.trim() || undefined,
      prenomResponsable: formValue.prenomResponsable?.trim() || undefined,
      nationaliteResponsable: formValue.nationaliteResponsable || undefined,
      telephoneResponsable: formValue.telephoneResponsable?.trim() || undefined,
      mailResponsable: formValue.mailResponsable?.trim() || undefined,
      statut: formValue.statut
    };

    // Ajouter l'ID si mise à jour
    if (this.isUpdate && formValue.id) {
      compagnieToSave.id = formValue.id;
    }

    const actionMsg = this.isUpdate ? 'modifier' : 'ajouter';

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir ${actionMsg} cette compagnie ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        if (this.isUpdate) {
          this.store.dispatch(compagnieAction.updateCompagnie(compagnieToSave));
        } else {
          this.store.dispatch(compagnieAction.createCompagnie(compagnieToSave));
        }
        this.compagnieDialog = false;
      }
    });
  }

  confirmDelete(compagnie: Compagnie) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la compagnie "${compagnie.nomCompagine}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      accept: () => this.store.dispatch(compagnieAction.deleteCompagnie(compagnie))
    });
  }

  confirmChangeStatus(compagnie: Compagnie) {
    const newStatus = compagnie.statut === Statut.ACTIF ? Statut.INACTIF : Statut.ACTIF;
    const action = newStatus === Statut.ACTIF ? 'activer' : 'désactiver';

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir ${action} la compagnie "${compagnie.nomCompagine}" ?`,
      header: 'Confirmation de changement de statut',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: compagnie.statut === Statut.ACTIF ? 
        'p-button-warning' : 
        'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptLabel: 'Oui, ' + action,
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.dispatch(
          compagnieAction.changerStatusCompagnie({ ...compagnie, statut: newStatus })
        );
      }
    });
  }

  onGlobalFilter(table: any, event: Event) {
    const input = (event.target as HTMLInputElement).value;
    table.filterGlobal(input, 'contains');
  }

  cancel() {
    this.compagnieForm.reset();
    this.compagnieDialog = false;
    this.isUpdate = false;
    this.popupHeader = 'Nouvelle Compagnie';
  }

  getStatutSeverity(statut: string): 'success' | 'danger' | 'secondary' | 'info' | 'warning' | 'contrast' {
    switch(statut?.toUpperCase()) {
        case 'ACTIF':
            return 'success';     // Vert - Compagnie active ✅
        case 'INACTIF':
            return 'danger';      // Rouge - Compagnie inactive ❌
        default:
            return 'secondary';
    }
}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}