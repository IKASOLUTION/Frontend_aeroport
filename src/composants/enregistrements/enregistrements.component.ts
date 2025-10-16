import { ChangeDetectionStrategy, Component, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DonneesService } from '../../services/donnees.service';
import { NotificationService } from '../../services/notification.service';
import { Vol } from '../../modeles/vol';
import { MotifVoyage } from '../../modeles/motif-voyage';
import { TypeDonneeBiometrique } from '../../modeles/donnee-biometrique';

interface EnregistrementForm {
  // Document
  type_document: 'PASSEPORT' | 'CNI' | 'PERMIS_CONDUIRE';
  numero_document: string;
  numero_nip: string | null;
  date_delivrance: string;
  lieu_delivrance: string;
  photo_profil: string | null;
  image_recto: string | null;
  image_verso: string | null;

  // Personal Info
  nom_famille: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  profession: string;
  
  // Coordonnees
  pays_residence: string;
  email_contact: string | null;
  telephone_burkina: string | null;
  telephone_etranger: string | null;
  adresse_burkina: string | null;
  adresse_etranger: string | null;
  
  // Voyage
  vol_id: number | null;
  ville_depart: string;
  ville_destination: string;
  date_voyage: string;
  heure_voyage: string;
  motif_voyage: string;
  etat_voyage: 'ALLER' | 'RETOUR' | 'ALLER_RETOUR';
  duree_sejour: number | null;
}

interface PassagerEnregistre {
  nom_complet: string;
  numero_document: string;
}

@Component({
  selector: 'app-enregistrements',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './enregistrements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnregistrementsComponent implements AfterViewChecked {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;

  formData = signal<EnregistrementForm>(this.getInitialFormData());
  formErrors = signal<{ [key: string]: string }>({});
  isSaving = signal(false);

  // --- Modals State ---
  isCaptureBiometriqueModalOpen = signal(false);
  isCameraModalOpen = signal(false);
  
  // Data for modals
  vols = signal<Vol[]>([]);
  motifs = signal<MotifVoyage[]>([]);
  passagerPourBiometrie = signal<PassagerEnregistre | null>(null);
  typesDocument: EnregistrementForm['type_document'][] = ['PASSEPORT', 'CNI', 'PERMIS_CONDUIRE'];
  etatsVoyage: EnregistrementForm['etat_voyage'][] = ['ALLER', 'RETOUR', 'ALLER_RETOUR'];
  
  // --- Biometric Capture State (for second modal) ---
  empreinteGaucheCapturee = signal(false);
  empreinteDroiteCapturee = signal(false);
  empreintePoucesCapturee = signal(false);
  capturedPhotoPourBiometrie = signal<string | null>(null);

  // --- Webcam State ---
  webcamStream = signal<MediaStream | null>(null);
  capturedPhotoBase64 = signal<string | null>(null);
  captureTarget = signal<'profil' | 'recto' | 'verso' | 'biometrique' | null>(null);

  // Computed value for readonly flight info
  selectedVolInfo = computed(() => {
    const volId = this.formData().vol_id;
    if (!volId) return null;
    return this.vols().find(v => v.id === volId);
  });

  constructor() {
    this.vols.set(this.donneesService.getVols().filter(v => !v.supprime));
    this.motifs.set(this.donneesService.getMotifsVoyages().filter(m => !m.supprime && m.statut === 'ACTIF'));
  }

  ngAfterViewChecked(): void {
    if (this.videoElement && this.webcamStream()) {
      this.videoElement.nativeElement.srcObject = this.webcamStream();
    }
  }

  updateFormDataField<K extends keyof EnregistrementForm>(field: K, value: EnregistrementForm[K]) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  getInitialFormData(): EnregistrementForm {
    return {
      type_document: 'PASSEPORT',
      numero_document: '',
      numero_nip: null,
      date_delivrance: '',
      lieu_delivrance: '',
      photo_profil: null,
      image_recto: null,
      image_verso: null,
      nom_famille: '',
      prenom: '',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: '',
      profession: '',
      pays_residence: '',
      email_contact: null,
      telephone_burkina: null,
      telephone_etranger: null,
      adresse_burkina: null,
      adresse_etranger: null,
      vol_id: null,
      ville_depart: '',
      ville_destination: '',
      date_voyage: '',
      heure_voyage: '',
      motif_voyage: '',
      etat_voyage: 'ALLER',
      duree_sejour: null,
    };
  }
  
  resetBiometricForm(): void {
    this.empreinteGaucheCapturee.set(false);
    this.empreinteDroiteCapturee.set(false);
    this.empreintePoucesCapturee.set(false);
    this.capturedPhotoPourBiometrie.set(null);
  }

  onVolSelectionChange(volId: number | string | null): void {
    const selectedId = volId ? +volId : null;

    if (selectedId) {
      const vol = this.vols().find(v => v.id === selectedId);
      if (vol) {
        const [date, time] = vol.date_depart.split('T');
        this.formData.update(data => ({
          ...data,
          vol_id: selectedId,
          ville_depart: vol.ville_depart,
          ville_destination: vol.ville_arrivee,
          date_voyage: date,
          heure_voyage: time.substring(0, 5) // HH:mm
        }));
      }
    } else {
        this.formData.update(data => ({
            ...data,
            vol_id: null,
            ville_depart: '',
            ville_destination: '',
            date_voyage: '',
            heure_voyage: ''
        }));
    }
  }

  validateForm(): boolean {
    const data = this.formData();
    const errors: { [key: string]: string } = {};

    // Document
    if (!data.numero_document.trim()) errors['numero_document'] = 'Le numéro de document est requis.';
    if (!data.date_delivrance) errors['date_delivrance'] = 'La date de délivrance est requise.';
    if (!data.lieu_delivrance.trim()) errors['lieu_delivrance'] = 'Le lieu de délivrance est requis.';
    if (!data.photo_profil) errors['photo_profil'] = 'La photo de profil est requise.';
    if (!data.image_recto) errors['image_recto'] = 'L\'image recto du document est requise.';
    if (!data.image_verso) errors['image_verso'] = 'L\'image verso du document est requise.';

    // Informations personnelles
    if (!data.nom_famille.trim()) errors['nom_famille'] = 'Le nom de famille est requis.';
    if (!data.prenom.trim()) errors['prenom'] = 'Le prénom est requis.';
    if (!data.date_naissance) errors['date_naissance'] = 'La date de naissance est requise.';
    if (!data.lieu_naissance.trim()) errors['lieu_naissance'] = 'Le lieu de naissance est requis.';
    if (!data.nationalite.trim()) errors['nationalite'] = 'La nationalité est requise.';
    if (!data.profession.trim()) errors['profession'] = 'La profession est requise.';
    if (!data.pays_residence.trim()) errors['pays_residence'] = 'Le pays de résidence est requis.';
    
    // Coordonnées
    if (!data.adresse_burkina?.trim() && !data.adresse_etranger?.trim()) {
      errors['adresse_burkina'] = 'Au moins une adresse (Burkina ou étranger) est requise.';
      errors['adresse_etranger'] = 'Au moins une adresse (Burkina ou étranger) est requise.';
    }
    if (data.telephone_burkina && !/^\+226\s?\d{8}$/.test(data.telephone_burkina)) {
      errors['telephone_burkina'] = 'Le format doit être +226 suivi de 8 chiffres.';
    }
    if (data.email_contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_contact)) {
        errors['email_contact'] = 'L\'adresse email est invalide.';
    }
    
    // Voyage
    if (!data.vol_id) errors['vol_id'] = 'La sélection d\'un vol est requise.';
    if (!data.motif_voyage) errors['motif_voyage'] = 'Le motif du voyage est requis.';
    if (data.duree_sejour === null || data.duree_sejour < 1) {
      errors['duree_sejour'] = 'La durée du séjour doit être d\'au moins 1 jour.';
    }
    
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }
  
  submitEnregistrement(): void {
    if (!this.validateForm()) {
      this.notificationService.show("Veuillez corriger les erreurs dans le formulaire.", "error");
      return;
    }
    
    this.isSaving.set(true);
    
    // Simulate API call to save initial registration
    setTimeout(() => {
      const data = this.formData();
      this.passagerPourBiometrie.set({
        nom_complet: `${data.prenom} ${data.nom_famille}`,
        numero_document: data.numero_document,
      });

      this.isSaving.set(false);
      this.resetBiometricForm();
      this.isCaptureBiometriqueModalOpen.set(true);
    }, 1000);
  }

  validerAvecBiometrie(): void {
     this.isSaving.set(true);
     // Simulate final save with biometrics
     setTimeout(() => {
        this.isSaving.set(false);
        this.notificationService.show('Enregistrement et données biométriques sauvegardés avec succès.', 'success');
        this.closeBiometricModal();
        this.resetForm();
     }, 1500);
  }

  resetForm(): void {
    this.formData.set(this.getInitialFormData());
    this.formErrors.set({});
  }

  closeBiometricModal(): void {
    this.isCaptureBiometriqueModalOpen.set(false);
    this.passagerPourBiometrie.set(null);
    this.arreterCamera();
  }

  // --- Webcam Methods ---
  async demarrerCamera(target: 'profil' | 'recto' | 'verso' | 'biometrique'): Promise<void> {
    if (this.webcamStream()) this.arreterCamera();
    this.captureTarget.set(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      this.webcamStream.set(stream);
      this.capturedPhotoBase64.set(null);
      this.isCameraModalOpen.set(true);
    } catch (err) {
      this.notificationService.show("Impossible d'accéder à la webcam. Vérifiez les permissions.", "error");
    }
  }

  arreterCamera(): void {
    this.webcamStream()?.getTracks().forEach(track => track.stop());
    this.webcamStream.set(null);
    this.isCameraModalOpen.set(false);
    this.capturedPhotoBase64.set(null);
    this.captureTarget.set(null);
  }
  
  capturerPhoto(): void {
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      this.capturedPhotoBase64.set(canvas.toDataURL('image/png'));
    }
  }
  
  reprendrePhoto(): void {
    this.capturedPhotoBase64.set(null);
  }

  confirmerPhoto(): void {
    const target = this.captureTarget();
    const photo = this.capturedPhotoBase64();
    if (!target || !photo) return;

    switch (target) {
      case 'profil':
        this.formData.update(data => ({ ...data, photo_profil: photo }));
        break;
      case 'recto':
        this.formData.update(data => ({ ...data, image_recto: photo }));
        break;
      case 'verso':
        this.formData.update(data => ({ ...data, image_verso: photo }));
        break;
      case 'biometrique':
        this.capturedPhotoPourBiometrie.set(photo);
        break;
    }
    this.arreterCamera();
  }
}
