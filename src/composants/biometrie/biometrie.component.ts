import { ChangeDetectionStrategy, Component, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { DonneeBiometrique, TypeDonneeBiometrique } from '../../modeles/donnee-biometrique';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

export interface DonneeBiometriqueGroupee {
  voyageur: string;
  numero_document: string;
  empreinteGauche?: DonneeBiometrique;
  empreinteDroite?: DonneeBiometrique;
  empreintePouces?: DonneeBiometrique;
  visage?: DonneeBiometrique;
  date_capture: string;
}

interface VoyageurPourSelection {
  nom_complet: string;
  numero_document: string;
}

@Component({
  selector: 'app-biometrie',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './biometrie.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometrieComponent implements AfterViewChecked {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private toutesLesDonnees = signal<DonneeBiometrique[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Data for filters and forms ---
  voyageursPourSelection = computed(() => {
    const voyageursAttente = this.donneesService.getVoyageursEnAttente().map(v => ({
      nom_complet: v.nom_complet,
      numero_document: v.numero_document
    }));

    const passagers = this.donneesService.getPassagers().map(p => ({
      nom_complet: `${p.prenom} ${p.nom}`,
      numero_document: p.numero_document
    }));

    // Combine and remove duplicates
    const all = [...voyageursAttente, ...passagers];
    const uniqueMap = new Map<string, VoyageurPourSelection>();
    all.forEach(v => {
      // Use doc number as unique key
      if (!uniqueMap.has(v.numero_document)) {
        uniqueMap.set(v.numero_document, v);
      }
    });

    return Array.from(uniqueMap.values());
  });

  donneesFiltrees = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.toutesLesDonnees().filter(donnee => {
      const parRecherche = recherche ? 
        donnee.voyageur.toLowerCase().includes(recherche) ||
        donnee.numero_document.toLowerCase().includes(recherche)
        : true;
      
      const captureDate = donnee.date_capture.split(' ')[0];
      const parDateDebut = dateDebut ? captureDate >= dateDebut : true;
      const parDateFin = dateFin ? captureDate <= dateFin : true;
      
      return parRecherche && parDateDebut && parDateFin;
    });
  });
  
  donneesGroupees = computed(() => {
    const grouped = new Map<string, DonneeBiometrique[]>();
    this.donneesFiltrees().forEach(donnee => {
        const key = donnee.numero_document;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(donnee);
    });

    return Array.from(grouped.entries()).map(([numero_document, donnees]) => {
      const voyageur = donnees[0].voyageur;
      const date_capture = donnees.reduce((latest, d) => d.date_capture > latest ? d.date_capture : latest, donnees[0].date_capture);
      const group: DonneeBiometriqueGroupee = { voyageur, numero_document, date_capture };
      donnees.forEach(d => {
        if (d.type_donnee === 'EMPREINTE_MAIN_GAUCHE') group.empreinteGauche = d;
        if (d.type_donnee === 'EMPREINTE_MAIN_DROITE') group.empreinteDroite = d;
        if (d.type_donnee === 'EMPREINTE_POUCES') group.empreintePouces = d;
        if (d.type_donnee === 'VISAGE') group.visage = d;
      });
      return group;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.donneesGroupees().length / this.itemsPerPage));
  
  donneesPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.donneesGroupees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.donneesGroupees().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 voyageurs";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} voyageurs`;
  });

  // --- State for Modals ---
  isCaptureModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  isCameraModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedDonneeGroupee = signal<DonneeBiometriqueGroupee | null>(null);
  captureFormData = signal<{ voyageur?: string, numero_document?: string }>({});
  
  // --- Form Capture State ---
  empreinteGaucheCapturee = signal(false);
  empreinteDroiteCapturee = signal(false);
  empreintePoucesCapturee = signal(false);
  capturedPhotoPourFormulaire = signal<string | null>(null);

  // --- Webcam State ---
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;
  webcamStream = signal<MediaStream | null>(null);
  capturedPhotoBase64 = signal<string | null>(null);

  // --- Form State ---
  isSaving = signal(false);
  formErrors = signal<{ [key: string]: string }>({});

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null); // This will always be an array of DonneeBiometriqueGroupee
  generatedDate = new Date().toLocaleDateString('fr-FR');

  constructor() {
    this.toutesLesDonnees.set(this.donneesService.getDonneesBiometriques());
  }

  ngAfterViewChecked(): void {
    if (this.videoElement && this.webcamStream()) {
      this.videoElement.nativeElement.srcObject = this.webcamStream();
    }
  }

  getDonneesDisponibles(donnee: DonneeBiometriqueGroupee): string {
    const parts: string[] = [];
    if (donnee.empreinteGauche || donnee.empreinteDroite || donnee.empreintePouces) {
      parts.push('Empreintes');
    }
    if (donnee.visage) {
      parts.push('Photo');
    }
    return parts.join(' + ') || 'Aucune donnée';
  }

  // --- Modal Management ---
  resetCaptureForm(): void {
    this.formErrors.set({});
    this.captureFormData.set({ voyageur: '', numero_document: '' });
    this.empreinteGaucheCapturee.set(false);
    this.empreinteDroiteCapturee.set(false);
    this.empreintePoucesCapturee.set(false);
    this.capturedPhotoPourFormulaire.set(null);
  }

  openCaptureModal(): void {
    this.modalMode.set('add');
    this.resetCaptureForm();
    this.isCaptureModalOpen.set(true);
  }

  openEditModal(donnee: DonneeBiometriqueGroupee): void {
    this.modalMode.set('edit');
    this.selectedDonneeGroupee.set(donnee);
    this.formErrors.set({});
    this.captureFormData.set({ voyageur: donnee.voyageur, numero_document: donnee.numero_document });
    
    this.empreinteGaucheCapturee.set(!!donnee.empreinteGauche);
    this.empreinteDroiteCapturee.set(!!donnee.empreinteDroite);
    this.empreintePoucesCapturee.set(!!donnee.empreintePouces);
    this.capturedPhotoPourFormulaire.set(donnee.visage?.donnee || null);

    this.isCaptureModalOpen.set(true);
  }

  openDetailsModal(donnee: DonneeBiometriqueGroupee): void {
    this.selectedDonneeGroupee.set(donnee);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(donnee: DonneeBiometriqueGroupee): void {
    this.selectedDonneeGroupee.set(donnee);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isCaptureModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedDonneeGroupee.set(null);
    this.formErrors.set({});
    this.arreterCamera();
    this.closePdfModal();
  }
  
  // --- PDF Modal Management ---
  openPdfModal(data: any, title: string): void {
    this.pdfData.set(data);
    this.pdfContentTitle.set(title);
    this.isPdfModalOpen.set(true);
  }

  closePdfModal(): void {
    this.isPdfModalOpen.set(false);
    this.pdfData.set(null);
    this.pdfContentTitle.set('');
  }

  // --- Webcam Methods ---
  async demarrerCamera(): Promise<void> {
    if (this.webcamStream()) this.arreterCamera();
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
    this.capturedPhotoPourFormulaire.set(this.capturedPhotoBase64());
    this.arreterCamera();
  }

  // --- CRUD Operations ---
  validateForm(): boolean {
    const formData = this.captureFormData();
    const errors: { [key: string]: string } = {};
    if (!formData.numero_document?.trim()) {
      errors['voyageur'] = 'La sélection d\'un voyageur est requise.';
    }
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveDonnee(): void {
    if (!this.validateForm()) return;
    
    this.isSaving.set(true);

    setTimeout(() => {
      const formData = this.captureFormData();
      const numero_document = formData.numero_document!;
      const selectedVoyageur = this.voyageursPourSelection().find(v => v.numero_document === numero_document);
      
      const voyageur = selectedVoyageur 
        ? selectedVoyageur.nom_complet 
        : (this.modalMode() === 'edit' ? this.selectedDonneeGroupee()?.voyageur : '');

      if (!voyageur) {
        this.notificationService.show("Voyageur introuvable.", "error");
        this.isSaving.set(false);
        return;
      }

      const dateCapture = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const nouvellesDonnees: DonneeBiometrique[] = [];

      let lastId = Math.max(0, ...this.toutesLesDonnees().map(d => d.id));

      const addRecord = (type: TypeDonneeBiometrique, data?: string) => {
        nouvellesDonnees.push({
          id: ++lastId,
          voyageur: voyageur,
          numero_document: numero_document,
          type_donnee: type,
          date_capture: dateCapture,
          donnee: data
        });
      };

      if (this.empreinteGaucheCapturee()) addRecord('EMPREINTE_MAIN_GAUCHE', this.donneesService.empreintePlaceholder);
      if (this.empreinteDroiteCapturee()) addRecord('EMPREINTE_MAIN_DROITE', this.donneesService.empreintePlaceholder);
      if (this.empreintePoucesCapturee()) addRecord('EMPREINTE_POUCES', this.donneesService.empreintePlaceholder);
      if (this.capturedPhotoPourFormulaire()) addRecord('VISAGE', this.capturedPhotoPourFormulaire()!);
      
      this.toutesLesDonnees.update(donnees => {
        const donneesFiltrees = this.modalMode() === 'edit' 
            ? donnees.filter(d => d.numero_document !== numero_document)
            : donnees;
        return [...donneesFiltrees, ...nouvellesDonnees];
      });
      
      const message = this.modalMode() === 'add' ? 'Données ajoutées avec succès.' : 'Données mises à jour avec succès.';
      this.notificationService.show(message);
      this.isSaving.set(false);
      this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const donneeToDelete = this.selectedDonneeGroupee();
    if (donneeToDelete) {
      this.toutesLesDonnees.update(donnees => 
        donnees.filter(d => d.numero_document !== donneeToDelete.numero_document)
      );
      this.notificationService.show(`Les données de "${donneeToDelete.voyageur}" ont été supprimées.`, 'info');
      if (this.donneesPaginees().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
    }
    this.closeModals();
  }

  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
