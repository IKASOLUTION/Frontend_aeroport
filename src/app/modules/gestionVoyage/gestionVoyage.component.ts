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
import * as enregistrementAction from '../../store/enregistrement/action';
import * as enregistrementSelector from '../../store/enregistrement/selector';
import * as globalSelector from '../../store/global-config/selector';
import { Compagnie } from 'src/app/store/compagnie/model';
import { StatusEnum, Statut } from 'src/app/store/global-config/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { E } from '@fullcalendar/core/internal-common';
import { Enregistrement } from 'src/app/store/enregistrement/model';

@Component({
  selector: 'app-gestion-voyages',
  standalone: true,
  templateUrl: './gestionVoyage.component.html',
  styleUrls: ['./gestionVoyage.component.scss'],
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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class CompagnieComponent implements OnInit, OnDestroy {
  countries: any[] = [];
  compagnies: Compagnie[] = [];
  selectedCompagnie: Compagnie = {};
  compagnieForm!: FormGroup;
  compagnieDialog = false;
  enregistrements: Enregistrement[] = [];
  selectedEnregistrement: Enregistrement= {}
  popupHeader = 'Nouvelle Compagnie';
  isUpdate = false;
  loading = true;
  destroy$ = new Subject<boolean>();
  cols: any[] = [];
  isDetailModalOpen = false;

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
        { field: 'nomFamille', header: 'Nom' },
            { field: 'prenom', header: 'Prénom' },
            { field: 'typeDocument', header: 'Type document' },
            { field: 'numeroDocument', header: 'N° document' },
            { field: 'nationalite', header: 'Nationalité' },
            { field: 'villeDepart', header: 'Ville départ' },
            { field: 'villeDestination', header: 'Destination' },
            { field: 'dateVoyage', header: 'Date voyage' },
            { field: 'motifVoyage', header: 'Motif' }
    ];

    this.store.dispatch(enregistrementAction.loadEnregistrement());
    this.subscribeToStoreUpdates();
    this.store.pipe(select(globalSelector.status), takeUntil(this.destroy$)).subscribe(status => {
      if (status && status.message) this.showToast(status.status, status.message);
    });
  }


   private subscribeToStoreUpdates(): void {
          // Écouter la liste des enregistrements
          this.store.pipe(
              select(enregistrementSelector.enregistrementList),
              takeUntil(this.destroy$)
          ).subscribe(value => {
              if (value) {
                  this.loading = false;
                    this.enregistrements = [...value];
              }});

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

 

   closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedEnregistrement = {};
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}