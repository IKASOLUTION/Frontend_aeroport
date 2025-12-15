import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { filter, debounceTime } from 'rxjs/operators';

// Store Actions & Selectors
import * as enregistrementAction from '../../../store/enregistrement/action';
import * as enregistrementSelector from '../../../store/enregistrement/selector';
import * as globalSelector from '../../../store/global-config/selector';
import * as volAction from '../../../store/vol/action';
import * as volSelector from '../../../store/vol/selector';

// Models
import { Enregistrement, MotifVoyage, TypeDocument } from 'src/app/store/enregistrement/model';
import { TypeVol, Vol } from 'src/app/store/vol/model';

// Services
import { CountryService } from 'src/app/demo/service/country.service';
import { NationaliteService } from 'src/app/demo/service/nationalite.service';
import { RegulaService } from 'src/app/store/regular.service';

// Components
import { LoadingSpinnerComponent } from '../../loading-spinner.component';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { NavbarComponent } from '../navbar/navbar.component';
import { StatutVoyageur } from 'src/app/store/motifVoyage/model';

interface FormFieldConfig {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  type: 'text' | 'date' | 'dropdown' | 'number';
  cols: number;
  required: boolean;
  inputType?: string;
  options?: any[];
}

@Component({
  selector: 'app-front-enregistrement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FieldsetModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    ToastModule,
    FileUploadModule,
    LoadingSpinnerComponent,
    NavbarComponent,
  ],
  providers: [MessageService],
  templateUrl: './preEnregistrement.component.html',
  styleUrls: ['./preEnregistrement.component.scss']
})
export class PreEnregistrementComponent implements OnInit {
  // Services injection
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly messageService = inject(MessageService);
  private readonly regulaService = inject(RegulaService);
  private readonly countryService = inject(CountryService);
  private readonly nationaliteService = inject(NationaliteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Signals
  loading = signal(false);
  isSaving = signal(false);
  countries = signal<any[]>([]);
  nationalites = signal<any[]>([]);
  volList = signal<Vol[]>([]);
  selectedVolInfo = signal<Vol | null>(null);
  currentDocumentType = signal<TypeDocument>(TypeDocument.CNI);
  
  // ✅ Signal pour gérer l'étape actuelle
  currentStep = signal<number>(1);

  // Form
  enregistrementForm!: FormGroup;

  // Computed signals
  hasErrors = computed(() => this.enregistrementForm?.invalid ?? false);

  // Configuration des champs
  readonly typeDocuments = [
    { label: 'Passeport', value: TypeDocument.PASSEPORT },
    { label: "Carte d'Identité", value: TypeDocument.CNI }
  ];

  readonly motifs = signal<{ libelle: string; value: MotifVoyage }[]>([
    { libelle: 'Affaires', value: MotifVoyage.AFFAIRES },
    { libelle: 'Tourisme', value: MotifVoyage.TOURISME },
    { libelle: 'Famille', value: MotifVoyage.FAMILLE },
    { libelle: 'Études', value: MotifVoyage.ETUDES },
    { libelle: 'Médical', value: MotifVoyage.MEDICAL }
  ]);

  readonly etatVoyageOptions = [
    { label: 'ALLER', value: 'ALLER' },
    { label: 'RETOUR', value: 'RETOUR' },
    { label: 'ALLER-RETOUR', value: 'ALLER_RETOUR' }
  ];

  // Configuration dynamique des champs
  documentFields = signal<FormFieldConfig[]>([
    { key: 'numeroDocument', label: 'Numéro de document', icon: 'pi pi-hashtag', placeholder: 'Numéro de document', type: 'text', cols: 3, required: true },
    { key: 'numeroNip', label: 'Numéro NIP (Optionnel)', icon: 'pi pi-key', placeholder: 'Numéro NIP', type: 'text', cols: 3, required: false },
    { key: 'dateDelivrance', label: 'Date de délivrance', icon: 'pi pi-calendar', placeholder: 'Sélectionner la date', type: 'date', cols: 3, required: true },
    { key: 'lieuDelivrance', label: 'Lieu de délivrance', icon: 'pi pi-map-marker', placeholder: 'Lieu de délivrance', type: 'text', cols: 3, required: false}
  ]);

  personalFields = signal<FormFieldConfig[]>([
    { key: 'prenom', label: 'Prénom', icon: 'pi pi-user', placeholder: 'Votre prénom', type: 'text', cols: 4, required: true },
    { key: 'nomFamille', label: 'Nom de famille', icon: 'pi pi-user', placeholder: 'Votre nom de famille', type: 'text', cols: 4, required: true },
    { key: 'profession', label: 'Profession', icon: 'pi pi-briefcase', placeholder: 'Votre profession', type: 'text', cols: 4, required: false },
    { key: 'dateNaissance', label: 'Date de naissance', icon: 'pi pi-calendar', placeholder: 'Sélectionner la date', type: 'date', cols: 4, required: true },
    { key: 'lieuNaissance', label: 'Lieu de naissance', icon: 'pi pi-map-marker', placeholder: 'Lieu de naissance', type: 'text', cols: 4, required: true },
    { key: 'nationalite', label: 'Nationalité', icon: 'pi pi-flag', placeholder: 'Votre nationalité', type: 'text', cols: 4, required: true }
  ]);

  readonly contactFields: FormFieldConfig[] = [
    { key: 'paysResidence', label: 'Pays de résidence', icon: 'pi pi-globe', placeholder: 'Sélectionnez le pays', type: 'dropdown', cols: 4, required: true },
    { key: 'emailContact', label: 'Email (Optionnel)', icon: 'pi pi-envelope', placeholder: 'votre@email.com', type: 'text', cols: 4, required: false, inputType: 'email' },
    { key: 'telephoneBurkina', label: 'Téléphone Burkina (Optionnel)', icon: 'pi pi-phone', placeholder: '+226 XX XX XX XX', type: 'text', cols: 4, required: false },
    { key: 'telephoneEtranger', label: 'Téléphone Étranger (Optionnel)', icon: 'pi pi-phone', placeholder: 'Téléphone étranger', type: 'text', cols: 4, required: false },
    { key: 'adresseBurkina', label: 'Adresse au Burkina', icon: 'pi pi-home', placeholder: 'Adresse au Burkina', type: 'text', cols: 4, required: true },
    { key: 'adresseEtranger', label: "Adresse à l'étranger", icon: 'pi pi-home', placeholder: "Adresse à l'étranger", type: 'text', cols: 4, required: true }
  ];

  readonly travelFields: FormFieldConfig[] = [
    { 
      key: 'motifVoyage', 
      label: 'Motif du voyage', 
      icon: 'pi pi-question-circle', 
      placeholder: 'Sélectionner un motif', 
      type: 'dropdown', 
      cols: 4, 
      required: true,
      options: this.motifs()
    },
    { 
      key: 'etatVoyage', 
      label: 'État du voyage', 
      icon: 'pi pi-arrow-right-arrow-left', 
      placeholder: 'Sélectionner', 
      type: 'dropdown', 
      cols: 4, 
      required: true,
      options: this.etatVoyageOptions
    },
    { 
      key: 'dureeSejour', 
      label: 'Durée du séjour (jours)', 
      icon: 'pi pi-clock', 
      placeholder: 'Durée en jours', 
      type: 'number', 
      cols: 4, 
      required: true 
    }
  ];

  ngOnInit(): void {
    this.handlePageLoad();
    this.initializeForm();
    this.loadInitialData();
    this.subscribeToStoreUpdates();
    this.setupDocumentTypeChange();
  }

  /**
   * ✅ Détecte si la page a été rafraîchie et nettoie si nécessaire
   */
  private handlePageLoad(): void {
    const navigationType = (performance.getEntriesByType('navigation')[0] as any)?.type;
    
    if (navigationType === 'reload') {
      console.log('🔄 Refresh détecté - Nettoyage du sessionStorage');
      this.clearLocalStorage();
    }
  }

  private initializeForm(): void {
    this.enregistrementForm = this.fb.group({
      // Document d'Identité
      typeDocument: [TypeDocument.CNI, Validators.required],
      numeroDocument: ['', Validators.required],
      numeroNip: [''],
      statut: [''],
      dateDelivrance: [null, Validators.required],
      lieuDelivrance: [''],
      imageRecto: [null, Validators.required],
      imageVerso: [null, Validators.required],
      photoProfil: [null, Validators.required],

      // Informations Personnelles
      prenom: ['', Validators.required],
      nomFamille: ['', Validators.required],
      profession: [''],
      dateNaissance: [null, Validators.required],
      lieuNaissance: [''],
      nationalite: [{ value: 'Burkinabè', disabled: true }, Validators.required],

      // Coordonnées
      paysResidence: [null, Validators.required],
      emailContact: ['', [Validators.email]],
      telephoneBurkina: [''],
      telephoneEtranger: [''],
      adresseBurkina: ['', Validators.required],
      adresseEtranger: ['', Validators.required],

      // Informations de Voyage
      volId: [null, Validators.required],
      motifVoyage: [null, Validators.required],
      etatVoyage: ['ALLER', Validators.required],
      dureeSejour: [1, [Validators.required, Validators.min(1)]],

      // Champs automatiques (cachés)
      villeDepart: [''],
      villeDestination: [''],
      dateVoyage: [''],
      heureVoyage: ['']
    });

    // Auto-save sur changement (debounced)
    this.enregistrementForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.saveToLocalStorage();
      });

    // Charger depuis sessionStorage si disponible
    this.loadFromLocalStorage();
  }

  // ===== 🔢 GESTION DU STEPPER =====

  /**
   * Passe à l'étape suivante
   */
  nextStep(): void {
    if (this.currentStep() < 4) {
      if (this.validateCurrentStep()) {
        this.currentStep.set(this.currentStep() + 1);
        this.scrollToTop();
      }
    }
  }

  /**
   * Revient à l'étape précédente
   */
  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      this.scrollToTop();
    }
  }

  /**
   * Valide les champs de l'étape actuelle
   */
  private validateCurrentStep(): boolean {
    const currentStepValue = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch (currentStepValue) {
      case 1: // Document d'identité
        fieldsToValidate = [
          'typeDocument',
          'imageRecto',
          'imageVerso',
          'photoProfil',
          'numeroDocument',
          'dateDelivrance',
          'lieuDelivrance'
        ];
        break;

      case 2: // Informations personnelles
        fieldsToValidate = [
          'prenom',
          'nomFamille',
          'dateNaissance',
          'lieuNaissance',
          'nationalite'
        ];
        break;

      case 3: // Coordonnées
        fieldsToValidate = [
          'paysResidence',
          'adresseBurkina',
          'adresseEtranger'
        ];
        break;

      case 4: // Voyage
        fieldsToValidate = [
          'volId',
          'motifVoyage',
          'etatVoyage',
          'dureeSejour'
        ];
        break;
    }

    // Marquer tous les champs comme "touched" pour afficher les erreurs
    fieldsToValidate.forEach(field => {
      const control = this.enregistrementForm.get(field);
      control?.markAsTouched();
    });

    // Vérifier si tous les champs sont valides
    const hasInvalidField = fieldsToValidate.some(field => {
      const control = this.enregistrementForm.get(field);
      return control?.invalid;
    });

    if (hasInvalidField) {
      this.showToast('warn', 'Veuillez remplir tous les champs obligatoires de cette étape');
      this.scrollToFirstError();
      return false;
    }

    return true;
  }

  /**
   * Scroll vers le haut de la page
   */
  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ===== 📄 GESTION DU DOCUMENT =====

  private setupDocumentTypeChange(): void {
    this.enregistrementForm.get('typeDocument')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type: TypeDocument) => {
        this.currentDocumentType.set(type);
        this.handleDocumentTypeChange(type);
      });
  }

  onTypeDocumentChange(type: TypeDocument): void {
    this.currentDocumentType.set(type);
    this.handleDocumentTypeChange(type);
  }

  private handleDocumentTypeChange(type: TypeDocument): void {
    this.updateNipField(type);
    this.updateNationaliteField(type);
    this.handleOCRReset(type);
  }

  private updateNipField(type: TypeDocument): void {
    const nipControl = this.enregistrementForm.get('numeroNip');
    
    if (type === TypeDocument.PASSEPORT) {
      nipControl?.setValue('');
      nipControl?.clearValidators();
      nipControl?.updateValueAndValidity();
    } else {
      nipControl?.clearValidators();
      nipControl?.updateValueAndValidity();
    }
  }

  private updateNationaliteField(type: TypeDocument): void {
    const nationaliteControl = this.enregistrementForm.get('nationalite');
    
    if (type === TypeDocument.CNI) {
      nationaliteControl?.setValue('Burkinabè');
      nationaliteControl?.disable({ onlySelf: true, emitEvent: false });
      nationaliteControl?.setValidators(Validators.required);
    } else {
      nationaliteControl?.enable({ onlySelf: true, emitEvent: false });
      if (!nationaliteControl?.value || nationaliteControl?.value === 'Burkinabè') {
        nationaliteControl?.setValue('');
      }
      nationaliteControl?.setValidators(Validators.required);
    }
    
    nationaliteControl?.updateValueAndValidity();
  }

  private handleOCRReset(type: TypeDocument): void {
    const currentData = this.enregistrementForm.value;
    const hasOCRData = currentData.numeroDocument || currentData.prenom || currentData.nomFamille;
    
    if (hasOCRData) {
      console.log('🔄 Réinitialisation des données OCR suite au changement de type');
    }
  }

  shouldShowNipField(): boolean {
    return this.currentDocumentType() === TypeDocument.CNI;
  }

  isCniDocument(): boolean {
    return this.currentDocumentType() === TypeDocument.CNI;
  }

  getDocumentFields(): FormFieldConfig[] {
    return this.documentFields();
  }

  getPersonalFields(): FormFieldConfig[] {
    return this.personalFields();
  }

  // ===== 📥 CHARGEMENT DES DONNÉES =====

  private async loadInitialData(): Promise<void> {
    this.loading.set(true);

    try {
      this.store.dispatch(volAction.loadVol());

      const [countries, nationalites] = await Promise.all([
        this.countryService.getCountries(),
        this.nationaliteService.getCountries()
      ]);

      this.countries.set(countries);
      this.nationalites.set(nationalites);

    } catch (error) {
      this.showToast('error', 'Erreur lors du chargement des données initiales');
      console.error('Error loading initial data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeToStoreUpdates(): void {
    // Vols
    this.store.select(volSelector.volList)
      .pipe(
        filter(vols => !!vols && vols.length > 0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(vols => {
        this.volList.set([...vols]);
      });

    // Notifications globales
    this.store.select(globalSelector.status)
      .pipe(
        filter(status => !!status?.message),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(status => {
        this.showToast(status.status, status.message);
        this.isSaving.set(false);
      });

    // Création réussie
    this.store.select(enregistrementSelector.selectedEnregistrement)
      .pipe(
        filter(created => !!created?.id),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(created => {
        this.isSaving.set(false);
        this.clearLocalStorage();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Votre pré-enregistrement a été créé avec succès !',
          life: 5000
        });
      });
  }

  // ===== 📁 UPLOAD DE FICHIERS + OCR =====

  onFileSelect(event: any, fieldName: 'imageRecto' | 'imageVerso' | 'photoProfil'): void {
    const file = event.files?.[0];
    if (!file) return;

    if (!this.validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = e.target.result;
      this.enregistrementForm.patchValue({ [fieldName]: base64String });

      this.messageService.add({
        severity: 'success',
        summary: 'Fichier chargé',
        detail: `Image ${this.getFieldLabel(fieldName)} chargée avec succès`,
        life: 2000
      });

      // Auto-fill avec OCR uniquement pour le recto
      if (fieldName === 'imageRecto') {
        this.autoFillFromDocument(file);
      }
    };

    reader.onerror = () => {
      this.showToast('error', 'Impossible de lire le fichier');
    };

    reader.readAsDataURL(file);
  }

  private validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      this.showToast('error', 'La taille du fichier ne doit pas dépasser 5MB');
      return false;
    }

    if (!validTypes.includes(file.type)) {
      this.showToast('error', 'Seuls les fichiers JPG, JPEG et PNG sont acceptés');
      return false;
    }

    return true;
  }

  private autoFillFromDocument(file: File): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Lecture du document',
      detail: 'Analyse du document en cours...',
      life: 3000
    });

    this.regulaService.verifyDocument(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.fillFormWithDocumentInfo(response);
          this.showToast('success', 'Les informations ont été extraites automatiquement');
        },
        error: (error) => {
          console.error('❌ Erreur Regula:', error);
          this.showToast('warn', 'Le document n\'a pas pu être lu automatiquement. Remplissez manuellement.');
        }
      });
  }

  private fillFormWithDocumentInfo(documentInfo: any): void {
    if (!documentInfo) return;

    const fieldMappings: { [key: string]: any } = {
      nomFamille: documentInfo.lastName || documentInfo.nomFamille,
      prenom: documentInfo.firstName || documentInfo.prenom,
      dateNaissance: this.parseDate(documentInfo.dateOfBirth || documentInfo.dateNaissance),
      lieuNaissance: documentInfo.lieuNaissance || documentInfo.placeOfBirth,
      numeroDocument: documentInfo.documentNumber || documentInfo.numeroDocument,
      dateDelivrance: this.parseDate(documentInfo.dateIssue || documentInfo.dateDelivrance),
      lieuDelivrance: documentInfo.issueState || documentInfo.lieuDelivrance,
      profession: documentInfo.profession
    };

    const nipValue = documentInfo.nip || documentInfo.numeroNip;
    if (this.currentDocumentType() === TypeDocument.CNI && nipValue) {
      fieldMappings['numeroNip'] = nipValue;
    }

    if (this.currentDocumentType() === TypeDocument.CNI) {
      fieldMappings['nationalite'] = 'Burkinabè';
    } else if (this.currentDocumentType() === TypeDocument.PASSEPORT) {
      const extractedNationality = documentInfo.nationality || documentInfo.nationalite;
      if (extractedNationality) {
        fieldMappings['nationalite'] = extractedNationality;
      }
    }

    this.enregistrementForm.patchValue(fieldMappings);
    this.updateNipField(this.currentDocumentType());
  }

  private parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
      const cleanedDate = dateString.trim();
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
        const [year, month, day] = cleanedDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanedDate)) {
        const [day, month, year] = cleanedDate.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      return new Date(cleanedDate);
    } catch (error) {
      return null;
    }
  }

  // ===== ✈️ SÉLECTION DU VOL =====

  onVolSelectionChange(volId: number): void {
    const selectedVol = this.volList().find(v => v.id === volId);
    if (!selectedVol) return;

    this.selectedVolInfo.set(selectedVol);

    const isArrivee = selectedVol.typeVol === TypeVol.ARRIVEE;
    const aeroport = selectedVol.aeroport?.nomAeroport ?? '';
    const agentAeroport = selectedVol.nomAgentConnecteAeroport ?? '';

    const villeDepart = isArrivee ? aeroport : agentAeroport;
    const villeDestination = isArrivee ? agentAeroport : aeroport;

    const isoDate = selectedVol.dateDepart ? new Date(selectedVol.dateDepart).toISOString() : null;
    const dateVoyage = isoDate ? isoDate.split('T')[0] : '';
    const heureVoyage = isoDate ? isoDate.split('T')[1].substring(0, 5) : '';

    this.enregistrementForm.patchValue({
      villeDepart,
      villeDestination,
      dateVoyage,
      heureVoyage
    });
  }

  // ===== 🛠️ HELPERS =====

  getImagePreview(fieldName: string): string | null {
    return this.enregistrementForm.get(fieldName)?.value;
  }

  getFieldError(fieldName: string): string | null {
    const control = this.enregistrementForm.get(fieldName);
    
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.hasError('required')) return 'Ce champ est requis';
      if (control.hasError('email')) return 'Email invalide';
      if (control.hasError('min')) return `La valeur minimale est ${control.getError('min').min}`;
    }
    
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'imageRecto': 'recto',
      'imageVerso': 'verso',
      'photoProfil': 'de profil'
    };
    return labels[fieldName] || '';
  }

  // ===== 📤 SUBMIT =====

  submitEnregistrement(): void {
    if (this.enregistrementForm.invalid) {
      this.markAllAsTouched();
      this.showToast('warn', 'Veuillez corriger les erreurs dans le formulaire');
      this.scrollToFirstError();
      return;
    }

    this.isSaving.set(true);
    const enregistrementData = this.prepareEnregistrementData();
    
    console.log('📤 Données à envoyer:', enregistrementData);
    this.store.dispatch(enregistrementAction.createEnregistrement(enregistrementData));
  }

  private prepareEnregistrementData(): Enregistrement {
    const formValue = this.enregistrementForm.getRawValue();
    
    return {
      ...formValue,
      dateDelivrance: this.formatDate(formValue.dateDelivrance),
      dateNaissance: this.formatDate(formValue.dateNaissance),
      dateVoyage: this.formatDate(formValue.dateVoyage),
      statut: StatutVoyageur.EN_ATTENTE,
    };
  }

  private formatDate(date: any): string {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    return '';
  }

  private markAllAsTouched(): void {
    Object.keys(this.enregistrementForm.controls).forEach(key => {
      this.enregistrementForm.get(key)?.markAsTouched();
    });
  }

  private scrollToFirstError(): void {
    const firstErrorField = Object.keys(this.enregistrementForm.controls)
      .find(key => this.enregistrementForm.get(key)?.invalid);
    
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ===== 🔄 RESET =====

  resetForm(): void {
    const defaultValues: any = {
      typeDocument: TypeDocument.CNI,
      etatVoyage: 'ALLER',
      dureeSejour: 1,
      nationalite: 'Burkinabè'
    };
    
    this.enregistrementForm.reset(defaultValues);
    this.currentDocumentType.set(TypeDocument.CNI);
    this.handleDocumentTypeChange(TypeDocument.CNI);
    this.selectedVolInfo.set(null);
    
    // ✅ Revenir à l'étape 1
    this.currentStep.set(1);
    
    this.clearLocalStorage();
    this.showToast('info', 'Le formulaire a été réinitialisé');
  }

  // ===== 💾 LOCAL STORAGE =====

  private saveToLocalStorage(): void {
    try {
      const formValue = this.enregistrementForm.getRawValue();
      const formDataWithoutImages: any = {};
      
      Object.keys(formValue).forEach(key => {
        if (!['imageRecto', 'imageVerso', 'photoProfil'].includes(key)) {
          formDataWithoutImages[key] = formValue[key];
        }
      });
      
      const draftData = {
        data: formDataWithoutImages,
        currentStep: this.currentStep(),
        timestamp: Date.now(),
        maxAge: 30 * 60 * 1000
      };
      
      sessionStorage.setItem('enregistrement_draft', JSON.stringify(draftData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const draft = sessionStorage.getItem('enregistrement_draft');
      if (draft) {
        const { data, currentStep, timestamp, maxAge } = JSON.parse(draft);
        const now = Date.now();
        
        const isExpired = maxAge && (now - timestamp) > maxAge;
        
        if (isExpired) {
          this.clearLocalStorage();
          return;
        }
        
        this.enregistrementForm.patchValue(data, { emitEvent: false });
        
        Object.keys(data).forEach(key => {
          const control = this.enregistrementForm.get(key);
          if (control) {
            control.markAsDirty();
            control.markAsTouched();
          }
        });
        
        const savedType = data.typeDocument || TypeDocument.CNI;
        this.currentDocumentType.set(savedType);
        this.handleDocumentTypeChange(savedType);
        
        if (currentStep) {
          this.currentStep.set(currentStep);
        }
        
        this.showToast('info', 'Brouillon restauré avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    }
  }

  private clearLocalStorage(): void {
    sessionStorage.removeItem('enregistrement_draft');
  }

  // ===== 🔔 TOAST =====

  private showToast(severity: string, message: string): void {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'error'> = {
      'success': 'success',
      'error': 'error',
      'warning': 'warn',
      'warn': 'warn',
      'info': 'info'
    };

    const summaries: Record<string, string> = {
      'success': 'Succès',
      'error': 'Erreur',
      'warning': 'Attention',
      'warn': 'Attention',
      'info': 'Information'
    };

    this.messageService.add({
      severity: severityMap[severity] || 'info',
      summary: summaries[severity] || 'Notification',
      detail: message,
      life: 5000
    });
  }

  ngOnDestroy(): void {
    console.log('🔄 Composant détruit');
  }
}