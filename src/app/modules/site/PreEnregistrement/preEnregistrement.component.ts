import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

interface UploadFieldConfig {
  key: string;
  label: string;
  icon: string;
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

  readonly uploadFields: UploadFieldConfig[] = [
    { key: 'imageRecto', label: 'Image recto du document', icon: 'pi pi-images' },
    { key: 'imageVerso', label: 'Image verso du document', icon: 'pi pi-images' },
    { key: 'photoProfil', label: 'Photo de profil', icon: 'pi pi-user' }
  ];

  // Configuration dynamique des champs
  documentFields = signal<FormFieldConfig[]>([
    { key: 'numeroDocument', label: 'Numéro de document', icon: 'pi pi-hashtag', placeholder: 'Numéro de document', type: 'text', cols: 3, required: true },
    { key: 'numeroNip', label: 'Numéro NIP (Optionnel)', icon: 'pi pi-key', placeholder: 'Numéro NIP', type: 'text', cols: 3, required: false },
    { key: 'dateDelivrance', label: 'Date de délivrance', icon: 'pi pi-calendar', placeholder: 'Sélectionner la date', type: 'date', cols: 3, required: true },
    { key: 'lieuDelivrance', label: 'Lieu de délivrance', icon: 'pi pi-map-marker', placeholder: 'Lieu de délivrance', type: 'text', cols: 3, required: true }
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
    this.initializeForm();
    this.loadInitialData();
    this.subscribeToStoreUpdates();
    this.setupDocumentTypeChange();
  }

  private initializeForm(): void {
    this.enregistrementForm = this.fb.group({
      // Document d'Identité
      typeDocument: [TypeDocument.CNI, Validators.required],
      numeroDocument: ['', Validators.required],
      numeroNip: [''],
      statut: [''],
      dateDelivrance: [null, Validators.required],
      lieuDelivrance: ['', Validators.required],
      imageRecto: [null, Validators.required],
      imageVerso: [null, Validators.required],
      photoProfil: [null, Validators.required],

      // Informations Personnelles
      prenom: ['', Validators.required],
      nomFamille: ['', Validators.required],
      profession: [''],
      dateNaissance: [null, Validators.required],
      lieuNaissance: ['', Validators.required],
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

    // Charger depuis localStorage si disponible
    this.loadFromLocalStorage();
  }

  /**
   * Configure les changements de type de document
   */
  private setupDocumentTypeChange(): void {
    this.enregistrementForm.get('typeDocument')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type: TypeDocument) => {
        this.currentDocumentType.set(type);
        this.handleDocumentTypeChange(type);
      });
  }

  /**
   * Gère les changements de type de document
   */
  onTypeDocumentChange(type: TypeDocument): void {
    this.currentDocumentType.set(type);
    this.handleDocumentTypeChange(type);
  }

  /**
   * Applique les règles selon le type de document
   */
  private handleDocumentTypeChange(type: TypeDocument): void {
    console.log(`🔄 Type de document changé: ${type}`);
    
    // 1. Gestion du champ NIP
    this.updateNipField(type);
    
    // 2. Gestion de la nationalité
    this.updateNationaliteField(type);
    
    // 3. Réinitialisation des données OCR si nécessaire
    this.handleOCRReset(type);
  }

  /**
   * Met à jour le champ NIP selon le type de document
   */
  private updateNipField(type: TypeDocument): void {
    const nipControl = this.enregistrementForm.get('numeroNip');
    
    if (type === TypeDocument.PASSEPORT) {
      // Pour passeport : vider et désactiver la validation
      nipControl?.setValue('');
      nipControl?.clearValidators();
      nipControl?.updateValueAndValidity();
    } else {
      // Pour CNI : rendre optionnel
      nipControl?.clearValidators();
      nipControl?.updateValueAndValidity();
    }
  }

  /**
   * Met à jour le champ nationalité selon le type de document
   */
  private updateNationaliteField(type: TypeDocument): void {
    const nationaliteControl = this.enregistrementForm.get('nationalite');
    
    if (type === TypeDocument.CNI) {
      // Pour CNI : forcer "Burkinabè" et rendre en lecture seule
      nationaliteControl?.setValue('Burkinabè');
      nationaliteControl?.disable({ onlySelf: true, emitEvent: false });
      nationaliteControl?.setValidators(Validators.required);
    } else {
      // Pour passeport : activer le champ et vider la valeur
      nationaliteControl?.enable({ onlySelf: true, emitEvent: false });
      if (!nationaliteControl?.value || nationaliteControl?.value === 'Burkinabè') {
        nationaliteControl?.setValue('');
      }
      nationaliteControl?.setValidators(Validators.required);
    }
    
    nationaliteControl?.updateValueAndValidity();
  }

  /**
   * Réinitialise les données OCR si le type change
   */
  private handleOCRReset(type: TypeDocument): void {
    const currentData = this.enregistrementForm.value;
    const hasOCRData = currentData.numeroDocument || currentData.prenom || currentData.nomFamille;
    
    if (hasOCRData) {
      console.log('🔄 Réinitialisation des données OCR suite au changement de type');
      // Ici vous pourriez vider certains champs si nécessaire
      // ou demander une confirmation à l'utilisateur
    }
  }

  /**
   * Vérifie si le champ NIP doit être affiché
   */
  shouldShowNipField(): boolean {
    return this.currentDocumentType() === TypeDocument.CNI;
  }

  /**
   * Vérifie si le document est une CNI
   */
  isCniDocument(): boolean {
    return this.currentDocumentType() === TypeDocument.CNI;
  }

  /**
   * Récupère les champs du document avec gestion dynamique
   */
  getDocumentFields(): FormFieldConfig[] {
    return this.documentFields();
  }

  /**
   * Récupère les champs personnels avec gestion dynamique
   */
  getPersonalFields(): FormFieldConfig[] {
    return this.personalFields();
  }

  private async loadInitialData(): Promise<void> {
    this.loading.set(true);

    try {
      // Dispatch pour charger les vols
      this.store.dispatch(volAction.loadVol());

      // Charger en parallèle
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

  // File Upload avec OCR
  onFileSelect(event: any, fieldName: 'imageRecto' | 'imageVerso' | 'photoProfil'): void {
    const file = event.files?.[0];
    if (!file) return;

    // Validation
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
          console.log('✅ Réponse complète Regula:', response);
          console.log('✅ Type de réponse:', typeof response);
          
          // La réponse devrait être l'objet DocumentData directement
          this.fillFormWithDocumentInfo(response);
          
          this.showToast('success', 'Les informations ont été extraites automatiquement');
        },
        error: (error) => {
          console.error('❌ Erreur Regula:', error);
          this.showToast('warn', 'Le document n\'a pas pu être lu automatiquement. Remplissez manuellement.');
        }
      });
  }

  /**
   * Remplit le formulaire avec les données extraites du document
   */
  private fillFormWithDocumentInfo(documentInfo: any): void {
    if (!documentInfo) {
      console.warn('⚠️ Aucune info document reçue');
      return;
    }

    console.log('📝 Remplissage du formulaire avec:', documentInfo);
    console.log('📋 Type de document actuel:', this.currentDocumentType());

    // --- 🛠 Mapping des données Regula → Formulaire ---
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

    // --- 🛠 Gestion du NIP selon le type de document ---
    const nipValue = documentInfo.nip || documentInfo.numeroNip;
    if (this.currentDocumentType() === TypeDocument.CNI && nipValue) {
      fieldMappings['numeroNip'] = nipValue;
    }

    // --- 🛠 Gestion de la nationalité selon le type de document ---
    if (this.currentDocumentType() === TypeDocument.CNI) {
      // Pour CNI : forcer "Burkinabè" (déjà fait dans le formulaire)
      fieldMappings['nationalite'] = 'Burkinabè';
    } else if (this.currentDocumentType() === TypeDocument.PASSEPORT) {
      // Pour passeport : utiliser la nationalité extraite du backend
      const extractedNationality = documentInfo.nationality || documentInfo.nationalite;
      if (extractedNationality) {
        fieldMappings['nationalite'] = extractedNationality;
      }
    }

    // Appliquer les modifications au formulaire
    this.enregistrementForm.patchValue(fieldMappings);

    // S'assurer que les règles de validation sont respectées
    this.updateNipField(this.currentDocumentType());
  }

  /**
   * Parse une date string en objet Date pour p-calendar
   */
  private parseDate(dateString: string | null | undefined): Date | null {
    console.log('🗓️ Parsing date:', dateString);
    if (!dateString) {
      console.warn('⚠️ Date vide ou undefined');
      return null;
    }

    try {
      // Nettoyer la chaîne
      const cleanedDate = dateString.trim();
      
      // Format YYYY-MM-DD (format du backend)
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
        const [year, month, day] = cleanedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Date invalide après parsing:', cleanedDate);
          return null;
        }
        
        console.log('✅ Date parsée (YYYY-MM-DD):', cleanedDate, '->', date);
        return date;
      }
      
      // Format DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanedDate)) {
        const [day, month, year] = cleanedDate.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Date invalide après parsing:', cleanedDate);
          return null;
        }
        
        console.log('✅ Date parsée (DD/MM/YYYY):', cleanedDate, '->', date);
        return date;
      }
      
      // Tentative avec le constructeur Date standard (ISO 8601)
      const date = new Date(cleanedDate);
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Date invalide:', cleanedDate);
        return null;
      }
      
      console.log('✅ Date parsée (ISO):', cleanedDate, '->', date);
      return date;
    } catch (error) {
      console.error('❌ Erreur parsing date:', dateString, error);
      return null;
    }
  }

  // Vol selection avec auto-fill
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

  // Helpers
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

  // Submit
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
   // this.store.dispatch(enregistrementAction.createEnregistrement(enregistrementData));
    this.resetForm();
  }

  private prepareEnregistrementData(): Enregistrement {
    const formValue = this.enregistrementForm.getRawValue(); // Utiliser getRawValue pour inclure les champs désactivés
    
    return {
      ...formValue,
      dateDelivrance: this.formatDate(formValue.dateDelivrance),
      dateNaissance: this.formatDate(formValue.dateNaissance),
      dateVoyage: this.formatDate(formValue.dateVoyage),
      statut: StatutVoyageur.EN_ATTENTE,

    };
  }

  /**
   * Formate une date pour l'envoi au backend (YYYY-MM-DD)
   */
  private formatDate(date: any): string {
    if (!date) return '';
    
    if (date instanceof Date) {
      // Éviter les problèmes de fuseau horaire
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    if (typeof date === 'string') {
      // Si c'est déjà une chaîne au format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
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

  // Reset
  resetForm(): void {
    // Réinitialiser avec les valeurs par défaut selon le type de document
    const defaultValues: any = {
      typeDocument: TypeDocument.CNI,
      etatVoyage: 'ALLER',
      dureeSejour: 1,
      nationalite: 'Burkinabè' // Valeur par défaut pour CNI
    };
    
    this.enregistrementForm.reset(defaultValues);
    
    // Réappliquer les règles après reset
    this.currentDocumentType.set(TypeDocument.CNI);
    this.handleDocumentTypeChange(TypeDocument.CNI);
    
    this.selectedVolInfo.set(null);
    this.clearLocalStorage();
    
    this.showToast('info', 'Le formulaire a été réinitialisé');
  }

  // LocalStorage
 private saveToLocalStorage(): void {
  try {
    const formValue = this.enregistrementForm.getRawValue();
    const formDataWithoutImages: any = {};
    
    Object.keys(formValue).forEach(key => {
      if (!['imageRecto', 'imageVerso', 'photoProfil'].includes(key)) {
        formDataWithoutImages[key] = formValue[key];
      }
    });
    
    // Ajouter un timestamp
    const draftData = {
      data: formDataWithoutImages,
      timestamp: Date.now(),
      // Option: durée de vie en millisecondes (ex: 5 minutes)
      maxAge: 5 * 60 * 1000
    };
    
    sessionStorage.setItem('enregistrement_draft', JSON.stringify(draftData));
    console.log('💾 Données sauvegardées dans sessionStorage');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
}


 private loadFromLocalStorage(): void {
  try {
    const draft = sessionStorage.getItem('enregistrement_draft');
    if (draft) {
      const { data, timestamp, maxAge } = JSON.parse(draft);
      const now = Date.now();
      
      // Vérifier si les données sont expirées
      const isExpired = maxAge && (now - timestamp) > maxAge;
      
      if (isExpired) {
        console.log('⏰ Données expirées, suppression...');
        this.clearLocalStorage();
        return;
      }
      
      console.log('📂 Données chargées depuis sessionStorage:', data);
      
      this.enregistrementForm.patchValue(data, { emitEvent: false });
      
      Object.keys(data).forEach(key => {
        const control = this.enregistrementForm.get(key);
        if (control) {
          control.markAsDirty();
          control.markAsTouched();
        }
      });
      
      // Appliquer les règles selon le type de document
      const savedType = data.typeDocument || TypeDocument.CNI;
      this.currentDocumentType.set(savedType);
      this.handleDocumentTypeChange(savedType);
      
      this.showToast('info', 'Brouillon restauré avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
  }
}

  private clearLocalStorage(): void {
  // Nettoyer sessionStorage
  sessionStorage.removeItem('enregistrement_draft');
}

  // Toast helper
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
    // Optionnel: nettoyer le localStorage quand on quitte la page
    // Mais attention, cela effacera aussi si l'utilisateur rafraîchit
    this.clearLocalStorage();
  }
}