import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { filter, Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as enregistrementAction from '../../store/enregistrement/action';
import * as enregistrementSelector from '../../store/enregistrement/selector';
import * as biometricAction from '../../store/biometric/action';
import * as biometricSelector from '../../store/biometric/selector';
import * as globalSelector from '../../store/global-config/selector';
import * as volAction from '../../store/vol/action';
import * as volSelector from '../../store/vol/selector';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { EmpreinteCapture, Enregistrement, InformationPersonnelle, MotifVoyage, TypeDocument } from 'src/app/store/enregistrement/model';
import { DonneeBiometrique } from 'src/app/store/biometric/model';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TypeVol, Vol } from 'src/app/store/vol/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { NationaliteService } from 'src/app/demo/service/nationalite.service';
import { Router } from '@angular/router';
import { IdentityData } from 'src/app/service-util/auth/regularForensic.service';
import { StatutVoyageur } from 'src/app/store/motifVoyage/model';
import { RegulaDocumentReaderService } from 'src/app/service-util/auth/regularForensic.service';
import { Avatar, AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

interface Passager {
  id: number;
  nom_complet: string;
  numeroDocument: string;
  informationPersonnelleId?: number;
}



@Component({
  selector: 'app-gestion-enregistrements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FieldsetModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    InputMaskModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    DialogModule,
    PanelModule,
    ToastModule,
    ConfirmDialogModule,
    LoadingSpinnerComponent,
    AvatarModule,
    ProgressBarModule,
    DividerModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './enregistrement.component.html'
})
export class EnregistrementComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  

  private store = inject(Store);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();
  private countryService = inject(CountryService);
  private nationaliteService = inject(NationaliteService);
  private router = inject(Router);

  // Signals pour la gestion de l'état local
  formData = signal<Enregistrement>({
    typeDocument: TypeDocument.PASSEPORT,
  });

  formErrors = signal<Record<string, string>>({});
  isSaving = signal<boolean>(false);
  loading = signal<boolean>(true);

  vols = signal<Vol[]>([]);
  motifs = signal<{ libelle: string; value: MotifVoyage }[]>([]);
  enregistrementList = signal<Enregistrement[]>([]);
  volList = signal<Vol[]>([]);

  selectedVolInfo = signal<Vol | null>(null);

  // Modale Biométrique - Empreintes avec images
  isCaptureBiometriqueModalOpen = signal<boolean>(false);
  passagerPourBiometrie = signal<Passager | null>(null);
  
  // Empreintes avec images
  empreinteGauche = signal<EmpreinteCapture>({ image: null, capturee: false });
  empreinteDroite = signal<EmpreinteCapture>({ image: null, capturee: false });
  empreintePouces = signal<EmpreinteCapture>({ image: null, capturee: false });
  
  capturedPhotoPourBiometrie = signal<string | null>(null);
  biometric = signal<DonneeBiometrique | null>(null);
  enregistrementSelect = signal<Enregistrement | null>(null);
  informationPersonnel: InformationPersonnelle = {};

  // Modale Caméra
  isCameraModalOpen = signal<boolean>(false);
  capturedPhotoBase64 = signal<string | null>(null);
  currentCameraTarget = signal<'recto' | 'verso' | 'profil' | 'biometrique' | 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces' | null>(null);
  private mediaStream: MediaStream | null = null;

  // Options pour les dropdowns
  typesDocument: Array<'PASSEPORT' | 'CNI'> = ['PASSEPORT', 'CNI'];
  etatsVoyage: Array<'ALLER' | 'RETOUR' | 'ALLER_RETOUR'> = ['ALLER', 'RETOUR', 'ALLER_RETOUR'];

  countries: any[] = [];
  selectedCountry: any;
  nationalites: any[] = [];
  selectedNationalite: any;
  type =TypeVol.ARRIVEE;
   // Remplacer l'injection
  regulaService = inject(RegulaDocumentReaderService);
  
  // Observables
  deviceStatus$ = this.regulaService.getDeviceStatus();
  identityData$ = this.regulaService.getIdentityData();
  
  // État local
  isScanning = signal<boolean>(false);
  autoDetectionEnabled = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
  this.initializeFormData();
  
  // Vérifier le statut du lecteur Regula
  const status = this.regulaService.getCurrentStatus();
  
  if (status.connected) {
    this.messageService.add({
      severity: 'success',
      summary: 'Lecteur Regula',
      detail: `${status.deviceName || 'Lecteur'} prêt à l\'usage`,
      life: 3000
    });
  } else {
    this.messageService.add({
      severity: 'warn',
      summary: 'Lecteur Regula',
      detail: 'Non connecté - Mode webcam uniquement',
      life: 4000
    });
  }

  // Surveiller le statut du lecteur
  this.deviceStatus$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(deviceStatus => {
    if (deviceStatus.error) {
      console.error('Erreur lecteur:', deviceStatus.error);
    }
    
    // Mettre à jour l'UI selon le statut
    if (deviceStatus.documentPresent && this.autoDetectionEnabled()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Document détecté',
        detail: 'Cliquez sur "Lire" pour scanner',
        life: 2000
      });
    }
  });

  // Surveiller les données d'identité
  this.identityData$.pipe(
    takeUntil(this.destroy$),
    filter(data => data !== null)
  ).subscribe(data => {
    if (data) {
      this.remplirFormulaireAvecDonnees(data);
      this.messageService.add({
        severity: 'success',
        summary: 'Document lu',
        detail: `${data.firstName} ${data.lastName}`,
        life: 3000
      });
    }
  });

  this.subscribeToStoreUpdates();
  this.loadVols();
  this.loadMotifs();
  
  // Charger les pays et nationalités
  this.countryService.getCountries().then((countries) => {
    this.countries = countries;
  });
  
  this.nationaliteService.getCountries().then((nationalites) => {
    this.nationalites = nationalites;
  });
}


  /**
   * Vérifie la connexion au lecteur Regula
   */
  async verifierLecteur() {
    try {
      const status = await this.regulaService.refreshStatus();
      
      if (!status.connected) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Lecteur non disponible',
          detail: 'Veuillez installer et démarrer le Regula Document Reader SDK',
          life: 5000
        });
        return;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Lecteur prêt',
        detail: status.deviceName || 'Regula 70X4M',
        life: 3000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: (error as Error).message || 'Impossible de vérifier le lecteur',
        life: 5000
      });
    }
  }

  /**
   * Active/désactive la détection automatique
   */
  toggleAutoDetection() {
    if (this.autoDetectionEnabled()) {
      this.regulaService.stopDocumentDetection();
      this.autoDetectionEnabled.set(false);
      this.messageService.add({
        severity: 'info',
        summary: 'Détection désactivée',
        detail: 'La détection automatique est maintenant désactivée',
        life: 2000
      });
    } else {
      this.regulaService.startDocumentDetection();
      this.autoDetectionEnabled.set(true);
      this.messageService.add({
        severity: 'info',
        summary: 'Détection activée',
        detail: 'Insérez un document dans le lecteur',
        life: 2000
      });
    }
  }

  /**
   * Lit le document manuellement
   */
  async lireDocument() {
    if (this.isScanning()) {
      return;
    }

    this.isScanning.set(true);

    try {
      // Vérifier d'abord la présence d'un document
      const hasDocument = await this.regulaService.checkDocumentPresence();
      
      if (!hasDocument) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Document absent',
          detail: 'Veuillez insérer un document dans le lecteur',
          life: 4000
        });
        this.isScanning.set(false);
        return;
      }

      // Message de traitement
      this.messageService.add({
        severity: 'info',
        summary: 'Lecture en cours',
        detail: 'Traitement du document...',
        life: 2000
      });

      // Lire les données
      this.regulaService.readDocument().subscribe({
        next: (data) => {
          console.log('Données lues:', data);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Lecture réussie',
            detail: `Document de ${data.firstName} ${data.lastName} traité`,
            life: 3000
          });
          
          this.isScanning.set(false);
        },
        error: (err) => {
          console.error('Erreur lecture:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur de lecture',
            detail: err.message || 'Impossible de lire le document',
            life: 5000
          });
          this.isScanning.set(false);
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: (error as Error).message || 'Une erreur est survenue',
        life: 5000
      });
      this.isScanning.set(false);
    }
  }

  /**
   * Lecture automatique lorsqu'un document est détecté
   */
  private async lireDocumentAuto() {
    if (this.isScanning()) {
      return;
    }

    // Désactiver temporairement la détection auto
    this.autoDetectionEnabled.set(false);
    this.regulaService.stopDocumentDetection();

    await this.lireDocument();

    // Réactiver la détection après 3 secondes
    setTimeout(() => {
      this.autoDetectionEnabled.set(true);
      this.regulaService.startDocumentDetection();
    }, 3000);
  }

  /**
   * Capture une image du document
   */
  async capturerImageDocument(type: 'white' | 'ir' | 'uv' = 'white') {
    try {
      const image = await this.regulaService.captureImage(type);
      
      // Assigner l'image selon le type
      if (type === 'white') {
        this.formData.update(form => ({
          ...form,
         // imageRecto: image
        }));
      } else if (type === 'ir') {
        this.formData.update(form => ({
          ...form,
        //  imageVerso: image
        }));
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Image capturée',
        detail: `Image ${type} capturée avec succès`,
        life: 2000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de capture',
        detail: (error as Error).message || 'Impossible de capturer l\'image',
        life: 4000
      });
    }
  }

  /**
   * Remplit le formulaire avec les données du document
   */
  // private remplirFormulaireAvecDonnees(data: any): void {
  //   this.formData.update(form => ({
  //     ...form,
  //     // Type de document
  //     //typeDocument: this.mapDocumentType(data.documentType),
  //     numeroDocument: data.documentNumber || form.numeroDocument,
      
  //     // Dates
  //     dateDelivrance: data.issueDate || form.dateDelivrance,
      
  //     // Informations personnelles
  //     nomFamille: data.lastName || form.nomFamille,
  //     prenom: data.firstName || form.prenom,
  //     dateNaissance: data.dateOfBirth || form.dateNaissance,
  //     lieuNaissance: data.placeOfBirth || form.lieuNaissance,
  //     nationalite: data.nationality || form.nationalite,
      
  //     // Numéro national
  //     numeroNip: data.nationalNumber || form.numeroNip,
      
  //     // Adresse
  //     adresseBurkina: data.address || form.adresseBurkina,
      
  //     // Photo
  //     photoProfil: data.photo || form.photoProfil
  //   }));

  //   // Sélectionner la nationalité
   

  // }

  /**
   * Convertit le type de document Regula vers le type local
   */
 /*  private mapDocumentType(docType?: string): 'PASSEPORT' | 'CNI' | undefined {
    if (!docType) return undefined;
    
    if (docType.toLowerCase().includes('passeport') || docType.toLowerCase().includes('passport')) {
      return TypeDocument.PASSEPORT.toString() as 'PASSEPORT';
    } else if (docType.toLowerCase().includes('carte') || docType.toLowerCase().includes('card')) {
      return TypeDocument.CNI.toString() as 'CNI';
    }
    
    return undefined;
  } */

  /**
   * Efface les données du lecteur
   */
  effacerDonneesLecteur(): void {
    this.regulaService.clearData();
    this.messageService.add({
      severity: 'info',
      summary: 'Données effacées',
      detail: 'Les données du lecteur ont été effacées',
      life: 2000
    });
  }

 



  findPays(country: any) {
        if (country && country.name) {
            this.formData().paysResidence = country.name;
        }
    }

    findNationalite(nationalite: any) {
        if (nationalite && nationalite.nationalite) {
            this.formData().nationalite = nationalite.nationalite;
        }
    }
  private loadEnregistrements(): void {
    this.store.dispatch(enregistrementAction.loadEnregistrement());
  }

  private subscribeToStoreUpdates(): void {
    this.store.pipe(
      select(enregistrementSelector.enregistrementList),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value) {
        this.loading.set(false);
        this.enregistrementList.set(value);
      }
    });

    this.store.pipe(
      select(volSelector.volList),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value) {
        this.volList.set([...value]);
                console.log("---------Afficher les vol", this.volList);

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

  private showToast(severity: string, message: string): void {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'error'> = {
      'success': 'success',
      'error': 'error',
      'warning': 'warn',
      'info': 'info'
    };

    this.messageService.add({
      severity: severityMap[severity] || 'info',
      summary: this.getSummaryBySeverity(severity),
      detail: message,
      life: 5000
    });
  }

  private getSummaryBySeverity(severity: string): string {
    const summaries: Record<string, string> = {
      'success': 'Succès',
      'error': 'Erreur',
      'warning': 'Attention',
      'info': 'Information'
    };
    return summaries[severity] || 'Notification';
  }

  initializeFormData(): void {
    this.formData.set({
      typeDocument: undefined,
      etatVoyage: 'ALLER',
      numeroDocument: '',
      numeroNip: null,
      dateDelivrance: '',
      lieuDelivrance: '',
      photoProfil: null,
      imageRecto: null,
      imageVerso: null,
      nomFamille: '',
      prenom: '',
      dateNaissance: '',
      lieuNaissance: '',
      nationalite: '',
      profession: '',
      paysResidence: '',
      emailContact: null,
      telephoneBurkina: null,
      telephoneEtranger: null,
      adresseBurkina: null,
      adresseEtranger: null,
      volId: null,
      villeDepart: '',
      villeDestination: '',
      dateVoyage: '',
      heureVoyage: '',
      motifVoyage: undefined,
      dureeSejour: null
    });
  }

  loadVols(): void {
    this.store.dispatch(volAction.loadVol());
  }

  loadMotifs(): void {
    this.motifs.set([
      { libelle: 'Affaires', value: MotifVoyage.AFFAIRES },
      { libelle: 'Tourisme', value: MotifVoyage.TOURISME },
      { libelle: 'Famille', value: MotifVoyage.FAMILLE },
      { libelle: 'Études', value: MotifVoyage.ETUDES },
      { libelle: 'Médical', value: MotifVoyage.MEDICAL },
    ]);
  }

  updateFormDataField(field: keyof Enregistrement, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));

    if (this.formErrors()[field]) {
      this.formErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  
 onVolSelectionChange(volId: number): void {
  const selectedVol = this.volList().find(v => v.id === volId);

  if (!selectedVol) return;

  // Met à jour la sélection affichée
  this.selectedVolInfo.set(selectedVol);

  // Détermine les valeurs selon typeVol
  const isArrivee = selectedVol.typeVol ===  TypeVol.ARRIVEE;

  const aeroport = selectedVol.aeroport?.nomAeroport ?? '';
  const agentAeroport = selectedVol.nomAgentConnecteAeroport ?? '';

  // Si ARRIVEE => aeroport → agent
  // Sinon => agent → aeroport
  const villeDepart = isArrivee ? aeroport : agentAeroport;
  const villeDestination = isArrivee ? agentAeroport : aeroport;

  // Conversion dates
  const isoDate = selectedVol.dateDepart
    ? new Date(selectedVol.dateDepart).toISOString()
    : null;

  const dateVoyage = isoDate ? isoDate.split('T')[0] : '';
  const heureVoyage = isoDate ? isoDate.split('T')[1].substring(0, 5) : '';

  // Mise à jour du formulaire
  this.formData.update(data => ({
    ...data,
    volId,
    villeDepart,
    villeDestination,
    dateVoyage,
    heureVoyage
  }));
}


  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const data = this.formData();

    if (!data.numeroDocument?.trim()) errors['numeroDocument'] = 'Le numéro de document est requis';
    if (!data.dateDelivrance) errors['dateDelivrance'] = 'La date de délivrance est requise';
    if (!data.lieuDelivrance?.trim()) errors['lieuDelivrance'] = 'Le lieu de délivrance est requis';
    if (!data.imageRecto) errors['imageRecto'] = 'L\'image recto est requise';
    if (!data.imageVerso) errors['imageVerso'] = 'L\'image verso est requise';
    if (!data.photoProfil) errors['photoProfil'] = 'La photo de profil est requise';
    if (!data.prenom?.trim()) errors['prenom'] = 'Le prénom est requis';
    if (!data.nomFamille?.trim()) errors['nomFamille'] = 'Le nom de famille est requis';
    if (!data.dateNaissance) errors['dateNaissance'] = 'La date de naissance est requise';
    if (!data.lieuNaissance?.trim()) errors['lieuNaissance'] = 'Le lieu de naissance est requis';
    if (!data.nationalite?.trim()) errors['nationalite'] = 'La nationalité est requise';
    if (!data.profession?.trim()) errors['profession'] = 'La profession est requise';
    if (!data.paysResidence?.trim()) errors['paysResidence'] = 'Le pays de résidence est requis';
    if (!data.adresseBurkina?.trim()) errors['adresseBurkina'] = 'L\'adresse au Burkina est requise';
    if (!data.adresseEtranger?.trim()) errors['adresseEtranger'] = 'L\'adresse à l\'étranger est requise';
    if (data.emailContact && !this.isValidEmail(data.emailContact)) errors['emailContact'] = 'L\'email n\'est pas valide';
    if (!data.volId) errors['volId'] = 'Le Voyage est requis';
    
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  submitEnregistrement(): void {
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Veuillez corriger les erreurs dans le formulaire',
        life: 5000
      });
      return;
    }
    const enregistrementData = this.prepareEnregistrementData();
    console.log('Données à soumettre suite:', enregistrementData);
    this.store.dispatch(enregistrementAction.createEnregistrement(enregistrementData));

    this.store.pipe(
      select(enregistrementSelector.selectedEnregistrement),
      takeUntil(this.destroy$)
    ).subscribe(created => {
      if (created && created.id) {
        this.enregistrementSelect.set(created);
        this.passagerPourBiometrie.set({
          id: created.id,
          nom_complet: `${created.prenom} ${created.nomFamille}`,
          numeroDocument: created.numeroDocument || '',
          informationPersonnelleId: created.informationPersonnelleId
        });
        this.isCaptureBiometriqueModalOpen.set(true);
      }
    });
  }

  private prepareEnregistrementData(): Enregistrement {
    const data = this.formData();
    return {
      ...data,
      dateDelivrance: this.formatDate(data.dateDelivrance),
      dateNaissance: this.formatDate(data.dateNaissance),
      dateVoyage: this.formatDate(data.dateVoyage),
      statut: StatutVoyageur.VALIDE
    };
  }

  private formatDate(date: any): string {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  resetForm(): void {
    this.initializeFormData();
    this.formErrors.set({});
    this.selectedVolInfo.set(null);

    this.messageService.add({
      severity: 'info',
      summary: 'Formulaire réinitialisé',
      detail: 'Le formulaire a été réinitialisé',
      life: 2000
    });
  }

  // Gestion de la caméra pour empreintes
  async capturerEmpreinte(type: 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces'): Promise<void> {
    this.currentCameraTarget.set(type);
    this.capturedPhotoBase64.set(null);
    this.isCameraModalOpen.set(true);

    try {
      await this.waitForView();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });

      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur caméra',
        detail: 'Impossible d\'accéder à la caméra',
        life: 3000
      });
      this.isCameraModalOpen.set(false);
    }
  }

  async demarrerCameraRegula(target: 'recto' | 'verso' | 'profil' | 'biometrique'): Promise<void> {
  this.currentCameraTarget.set(target);
  this.capturedPhotoBase64.set(null);
  this.isCameraModalOpen.set(true);

  try {
    await this.waitForView();

    // Lister tous les périphériques vidéo
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    console.log('Périphériques vidéo disponibles:', videoDevices);

    // Filtrer pour exclure le Regula (en cherchant par nom ou ID)
    const webcam = videoDevices.find(device => 
      !device.label.toLowerCase().includes('regula') &&
      !device.label.toLowerCase().includes('document') &&
      !device.label.toLowerCase().includes('scanner')
    );

    if (!webcam) {
      throw new Error('Aucune webcam standard trouvée');
    }

    // Utiliser spécifiquement la webcam identifiée
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        deviceId: { exact: webcam.deviceId },
        width: 1280, 
        height: 720 
      }
    });

    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = this.mediaStream;
    }
  } catch (error) {
    console.error('Erreur d\'accès à la caméra:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur caméra',
      detail: 'Impossible d\'accéder à la caméra',
      life: 3000
    });
    this.isCameraModalOpen.set(false);
  }
}


async selectWebcam(): Promise<MediaDeviceInfo | null> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    // Afficher les appareils pour déboguer
    console.log('Caméras disponibles:', videoDevices.map(d => ({
      id: d.deviceId,
      label: d.label
    })));

    // Stratégie de sélection
    // 1. Chercher une webcam intégrée
    let webcam = videoDevices.find(d => 
      d.label.toLowerCase().includes('integrated') ||
      d.label.toLowerCase().includes('built-in') ||
      d.label.toLowerCase().includes('facetime')
    );

    // 2. Sinon, prendre la première qui n'est PAS le Regula
    if (!webcam) {
      webcam = videoDevices.find(d => 
        !d.label.toLowerCase().includes('regula') &&
        !d.label.toLowerCase().includes('document') &&
        !d.label.toLowerCase().includes('reader') &&
        !d.label.toLowerCase().includes('scanner')
      );
    }

    // 3. En dernier recours, prendre le 2ème périphérique
    if (!webcam && videoDevices.length > 1) {
      webcam = videoDevices[1];
    }

    return webcam || null;
  } catch (error) {
    console.error('Erreur sélection webcam:', error);
    return null;
  }
}



  async demarrerCamera(target: 'recto' | 'verso' | 'profil' | 'biometrique'): Promise<void> {
    this.currentCameraTarget.set(target);
    this.capturedPhotoBase64.set(null);
    this.isCameraModalOpen.set(true);

    try {
      await this.waitForView();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });

      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur caméra',
        detail: 'Impossible d\'accéder à la caméra',
        life: 3000
      });
      this.isCameraModalOpen.set(false);
    }
  }

  private waitForView(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  capturerPhoto(): void {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoBase64 = canvas.toDataURL('image/jpeg', 0.8);
    this.capturedPhotoBase64.set(photoBase64);
  }

  reprendrePhoto(): void {
    this.capturedPhotoBase64.set(null);
  }

  confirmerPhoto(): void {
    const photo = this.capturedPhotoBase64();
    const target = this.currentCameraTarget();

    if (!photo || !target) return;

    if (target === 'biometrique') {
      this.capturedPhotoPourBiometrie.set(photo);
    } else if (target === 'empreinteGauche') {
      this.empreinteGauche.set({ image: photo, capturee: true });
    } else if (target === 'empreinteDroite') {
      this.empreinteDroite.set({ image: photo, capturee: true });
    } else if (target === 'empreintePouces') {
      this.empreintePouces.set({ image: photo, capturee: true });
    } else {
      this.formData.update(data => ({
        ...data,
        [target === 'recto' ? 'imageRecto' : target === 'verso' ? 'imageVerso' : 'photoProfil']: photo
      }));
    }

    this.arreterCamera();
  }

  arreterCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCameraModalOpen.set(false);
    this.capturedPhotoBase64.set(null);
    this.currentCameraTarget.set(null);
  }

  closeBiometricModal(): void {
    this.isCaptureBiometriqueModalOpen.set(false);
    this.passagerPourBiometrie.set(null);
    this.empreinteGauche.set({ image: null, capturee: false });
    this.empreinteDroite.set({ image: null, capturee: false });
    this.empreintePouces.set({ image: null, capturee: false });
    this.capturedPhotoPourBiometrie.set(null);
  }

  validerAvecBiometrie(): void {
    if (!this.empreinteGauche().capturee || !this.empreinteDroite().capturee ||
      !this.empreintePouces().capturee || !this.capturedPhotoPourBiometrie()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Données incomplètes',
        detail: 'Veuillez capturer toutes les données biométriques',
        life: 3000
      });
      return;
    }

    const passager = this.passagerPourBiometrie();
    if (!passager) return;

    // Convertir les images en fichiers
    const empreinteGaucheFile = this.convertBase64ToFile(this.empreinteGauche().image, 'empreinte_gauche.jpg');
    const empreinteDroiteFile = this.convertBase64ToFile(this.empreinteDroite().image, 'empreinte_droite.jpg');
    const empreintePoucesFile = this.convertBase64ToFile(this.empreintePouces().image, 'empreinte_pouces.jpg');
    const photoBiometriqueFile = this.convertBase64ToFile(this.capturedPhotoPourBiometrie(), 'photo_biometrique.jpg');

    // Vérifier que toutes les conversions ont réussi
    if (!empreinteGaucheFile || !empreinteDroiteFile || !empreintePoucesFile || !photoBiometriqueFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de conversion',
        detail: 'Impossible de convertir les images capturées',
        life: 3000
      });
      return;
    }

    this.biometric.set({
      informationPersonnelleId: this.enregistrementSelect()?.informationPersonnelleId,
      empreinteGauche: empreinteGaucheFile,
      empreinteDroite: empreinteDroiteFile,
      empreintePouces: empreintePoucesFile,
      photoBiometrique: photoBiometriqueFile
    });

    const biometricData = this.biometric();
    if (biometricData) {
      this.store.dispatch(biometricAction.createDonneeBiometrique(biometricData));

      this.router.navigateByUrl('/admin/gestion-enregistrements');
    }

    this.closeBiometricModal();
    this.resetForm();
  }

  private convertBase64ToFile(base64String: string | null, filename: string = 'photo.jpg'): File | undefined {
    if (!base64String) return undefined;

    try {
      const base64Data = base64String.split(',')[1] || base64String;
      const byteString = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      return new File([blob], filename, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Erreur conversion base64 vers File:', error);
      return undefined;
    }
  }



  async scannerDocumentAvecRegula(type: 'recto' | 'verso'): Promise<void> {
  const status = this.regulaService.getCurrentStatus();
  
  if (!status.connected || !status.ready) {
    this.messageService.add({
      severity: 'error',
      summary: 'Lecteur non disponible',
      detail: 'Le lecteur Regula n\'est pas connecté. Utilisez la webcam.',
      life: 4000
    });
    return;
  }

  try {
    this.isScanning.set(true);
    
    // Vérifier la présence d'un document
    const hasDocument = await this.regulaService.checkDocumentPresence();
    
    if (!hasDocument) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Document absent',
        detail: 'Veuillez insérer un document dans le lecteur',
        life: 4000
      });
      this.isScanning.set(false);
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Scan en cours',
      detail: `Capture de l'image ${type}...`,
      life: 2000
    });

    // Capturer l'image
    const imageBase64 = await this.regulaService.captureImage('white');
     const file = this.base64ToFile(imageBase64, type === 'recto' ? 'recto.jpg' : 'verso.jpg');
    
    // Mettre à jour le formulaire
    if (type === 'recto') {
      this.formData.update(form => ({
        ...form,
        imageRecto: file
      }));
    } else {
      this.formData.update(form => ({
        ...form,
        imageVerso: file
      }));
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Image capturée',
      detail: `Image ${type} enregistrée avec succès`,
      life: 3000
    });

  } catch (error) {
    console.error('Erreur scan document:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur de scan',
      detail: (error as Error).message || 'Impossible de scanner le document',
      life: 5000
    });
  } finally {
    this.isScanning.set(false);
  }
}

base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Lire complètement le document et extraire les données
 */
async lireEtExtraireDocument(): Promise<void> {
  const status = this.regulaService.getCurrentStatus();
  
  if (!status.connected || !status.ready) {
    this.messageService.add({
      severity: 'error',
      summary: 'Lecteur non disponible',
      detail: 'Le lecteur Regula n\'est pas connecté',
      life: 4000
    });
    return;
  }

  try {
    this.isScanning.set(true);
    
    // Vérifier la présence d'un document
    const hasDocument = await this.regulaService.checkDocumentPresence();
    
    if (!hasDocument) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Document absent',
        detail: 'Veuillez insérer un document dans le lecteur',
        life: 4000
      });
      this.isScanning.set(false);
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Lecture en cours',
      detail: 'Analyse du document...',
      life: 2000
    });

    // Lire le document (retourne un Observable)
    this.regulaService.readDocument().subscribe({
      next: (data) => {
        console.log('✅ Données extraites:', data);
        
        // Les données sont automatiquement remplies via l'observable
        // mais vous pouvez aussi les utiliser directement ici
        
        this.messageService.add({
          severity: 'success',
          summary: 'Document lu',
          detail: `${data.firstName} ${data.lastName} - ${data.documentNumber}`,
          life: 5000
        });
        
        this.isScanning.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur lecture:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de lecture',
          detail: err.message || 'Impossible de lire le document',
          life: 5000
        });
        this.isScanning.set(false);
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: (error as Error).message || 'Une erreur est survenue',
      life: 5000
    });
    this.isScanning.set(false);
  }
}

/**
 * Remplit le formulaire avec les données extraites du document
 */
private remplirFormulaireAvecDonnees(data: IdentityData): void {
  console.log('Remplissage formulaire avec:', data);

  this.formData.update(form => ({
    ...form,
    // Type de document
    typeDocument: this.mapDocumentType(data.documentType),
    numeroDocument: data.documentNumber || form.numeroDocument,
    
    // Dates
    dateDelivrance: this.parseDate(data.issueDate) || form.dateDelivrance,
    lieuDelivrance: data.issuingAuthority || form.lieuDelivrance,
    
    // Informations personnelles
    nomFamille: data.lastName || form.nomFamille,
    prenom: data.firstName || form.prenom,
    dateNaissance: this.parseDate(data.dateOfBirth) || form.dateNaissance,
    lieuNaissance: data.placeOfBirth || form.lieuNaissance,
    nationalite: data.nationality || form.nationalite,
    
    // Numéro national
    numeroNip: data.nationalNumber || form.numeroNip,
    
    // Adresse
    adresseBurkina: data.address || form.adresseBurkina,
    
    // Photo
    //photoProfil: data.photo || form.photoProfil
  }));

  // Sélectionner la nationalité dans le dropdown
  if (data.nationality) {
    const nat = this.nationalites.find(n => 
      n.nationalite.toLowerCase().includes(data.nationality!.toLowerCase())
    );
    if (nat) {
      this.selectedNationalite = nat;
    }
  }
}

/**
 * Convertit le type de document Regula vers le type local
 */
private mapDocumentType(docType?: string): TypeDocument | undefined {
  if (!docType) return undefined;
  
  const lowerType = docType.toLowerCase();
  
  if (lowerType.includes('passeport') || lowerType.includes('passport')) {
    return TypeDocument.PASSEPORT;
  } else if (lowerType.includes('carte') || lowerType.includes('card') || lowerType.includes('cni')) {
    return TypeDocument.CNI;
  }
  
  return undefined;
}

/**
 * Parse une date depuis le format Regula
 */
private parseDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  
  try {
    // Regula retourne souvent DDMMYYYY ou DD/MM/YYYY
    const cleaned = dateStr.replace(/[\/\-\.]/g, '');
    
    if (cleaned.length === 8) {
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      
      // Format ISO pour Angular calendar: YYYY-MM-DD
      return `${year}-${month}-${day}`;
    }
    
    return dateStr;
  } catch (error) {
    console.error('Erreur parse date:', error);
    return dateStr;
  }
}


  ngOnDestroy(): void {
    this.arreterCamera();
    this.destroy$.next();
    this.destroy$.complete();
  }
}