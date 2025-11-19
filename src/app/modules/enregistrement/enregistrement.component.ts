import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
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
import { Enregistrement, InformationPersonnelle, MotifVoyage, TypeDocument } from 'src/app/store/enregistrement/model';
import { DonneeBiometrique } from 'src/app/store/biometric/model';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Vol } from 'src/app/store/vol/model';

interface Passager {
  id: number;
  nom_complet: string;
  numeroDocument: string;
  informationPersonnelleId?: number;
}

interface EmpreinteCapture {
  image: string | null;
  capturee: boolean;
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
    LoadingSpinnerComponent
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

  // Signals pour la gestion de l'état local
  formData = signal<Enregistrement>({
    typeDocument: TypeDocument.PASSEPORT,
    etatVoyage: 'ALLER'
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
  typesDocument: Array<'PASSEPORT' | 'CNI' | 'PERMIS_CONDUIRE'> = ['PASSEPORT', 'CNI', 'PERMIS_CONDUIRE'];
  etatsVoyage: Array<'ALLER' | 'RETOUR' | 'ALLER_RETOUR'> = ['ALLER', 'RETOUR', 'ALLER_RETOUR'];

  ngOnInit(): void {
    this.initializeFormData();
    this.subscribeToStoreUpdates();
    this.loadVols();
    this.loadMotifs();
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
    if (selectedVol) {
      this.selectedVolInfo.set(selectedVol);
      this.formData.update(data => ({
        ...data,
        volId: volId,
        villeDepart: selectedVol.villeDepart?.nom,
        villeDestination: selectedVol.villeArrivee?.nom,
        dateVoyage: selectedVol.dateDepart
          ? new Date(selectedVol.dateDepart).toISOString().split('T')[0]
          : '',
        heureVoyage: selectedVol.dateDepart
          ? new Date(selectedVol.dateDepart).toISOString().split('T')[1].substring(0, 5)
          : ''
      }));
    }
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
    if (!data.volId) errors['volId'] = 'Le vol est requis';
    if (data.motifVoyage === undefined) errors['motifVoyage'] = 'Le motif du voyage est requis';
    if (!data.dureeSejour || data.dureeSejour < 1) errors['dureeSejour'] = 'La durée du séjour doit être d\'au moins 1 jour';

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
      dateVoyage: this.formatDate(data.dateVoyage)
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

  ngOnDestroy(): void {
    this.arreterCamera();
    this.destroy$.next();
    this.destroy$.complete();
  }
}