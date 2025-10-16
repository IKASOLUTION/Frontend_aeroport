import { ChangeDetectionStrategy, Component, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { DonneesService } from '../../services/donnees.service';
import { NotificationService } from '../../services/notification.service';
import { VoyageurAttente } from '../../modeles/voyageur-attente';
import { DonneeBiometrique, TypeDonneeBiometrique } from '../../modeles/donnee-biometrique';

@Component({
  selector: 'app-voyageurs-attente',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './voyageurs-attente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoyageursAttenteComponent implements AfterViewChecked {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);

  private tousLesVoyageurs = signal<VoyageurAttente[]>([]);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Filtered Data ---
  voyageursFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.tousLesVoyageurs().filter(voyageur => {
      const parRecherche = recherche
        ? voyageur.nom_complet.toLowerCase().includes(recherche) ||
          voyageur.numero_document.toLowerCase().includes(recherche) ||
          voyageur.numero_vol.toLowerCase().includes(recherche) ||
          voyageur.ville_arrivee.toLowerCase().includes(recherche) ||
          voyageur.ville_depart.toLowerCase().includes(recherche)
        : true;

      const parDateDebut = dateDebut ? voyageur.date_voyage >= dateDebut : true;
      const parDateFin = dateFin ? voyageur.date_voyage <= dateFin : true;
      
      return parRecherche && parDateDebut && parDateFin;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.voyageursFiltres().length / this.itemsPerPage));
  
  voyageursPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.voyageursFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.voyageursFiltres().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 voyageurs";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} voyageurs`;
  });

  // --- State for Modals ---
  isDetailsModalOpen = signal(false);
  isRejectModalOpen = signal(false);
  isCaptureBiometriqueModalOpen = signal(false);
  isCameraModalOpen = signal(false);
  selectedVoyageur = signal<VoyageurAttente | null>(null);

  // --- Biometric Capture State ---
  isSaving = signal(false);
  empreinteGaucheCapturee = signal(false);
  empreinteDroiteCapturee = signal(false);
  empreintePoucesCapturee = signal(false);
  capturedPhotoPourFormulaire = signal<string | null>(null);
  
  // --- Webcam State ---
  webcamStream = signal<MediaStream | null>(null);
  capturedPhotoBase64 = signal<string | null>(null);

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesVoyageurs.set(this.donneesService.getVoyageursEnAttente());
  }
  
  ngAfterViewChecked(): void {
    if (this.videoElement && this.webcamStream()) {
      this.videoElement.nativeElement.srcObject = this.webcamStream();
    }
  }

  getStatusClass(status: 'En attente'): string {
    return 'bg-yellow-100 text-yellow-800';
  }

  // --- Modal Management ---
  openDetailsModal(voyageur: VoyageurAttente): void {
    this.selectedVoyageur.set(voyageur);
    this.isDetailsModalOpen.set(true);
  }

  openRejectModal(): void {
    if (!this.selectedVoyageur()) return;
    this.isDetailsModalOpen.set(false);
    this.isRejectModalOpen.set(true);
  }

  resetCaptureForm(): void {
    this.empreinteGaucheCapturee.set(false);
    this.empreinteDroiteCapturee.set(false);
    this.empreintePoucesCapturee.set(false);
    this.capturedPhotoPourFormulaire.set(null);
  }

  openCaptureBiometriqueModal(): void {
    const voyageur = this.selectedVoyageur();
    if (!voyageur) return;
    this.resetCaptureForm();
    this.isDetailsModalOpen.set(false);
    this.isCaptureBiometriqueModalOpen.set(true);
  }

  closeModals(): void {
    this.isDetailsModalOpen.set(false);
    this.isRejectModalOpen.set(false);
    this.isCaptureBiometriqueModalOpen.set(false);
    this.selectedVoyageur.set(null);
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

  // --- Actions ---
  confirmRejection(): void {
    const voyageurARejeter = this.selectedVoyageur();
    if (voyageurARejeter) {
      this.tousLesVoyageurs.update(voyageurs => 
        voyageurs.filter(v => v.id !== voyageurARejeter.id)
      );
      this.notificationService.show(`Le voyageur "${voyageurARejeter.nom_complet}" a été rejeté.`, 'info');
      if (this.voyageursPagines().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
    }
    this.closeModals();
  }

  validerVoyageur(): void {
    this.isSaving.set(true);
    const voyageurAValider = this.selectedVoyageur();
    if (!voyageurAValider) {
      this.isSaving.set(false);
      return;
    }

    setTimeout(() => {
      const toutesLesDonneesBio = this.donneesService.getDonneesBiometriques();
      let lastId = Math.max(0, ...toutesLesDonneesBio.map(d => d.id));
      const nouvellesDonnees: DonneeBiometrique[] = [];
      const dateCapture = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const addRecord = (type: TypeDonneeBiometrique, data?: string) => {
        // FIX: Added missing numero_document property to conform to DonneeBiometrique interface
        nouvellesDonnees.push({
          id: ++lastId,
          voyageur: voyageurAValider.nom_complet,
          numero_document: voyageurAValider.numero_document,
          type_donnee: type,
          date_capture: dateCapture,
          donnee: data,
        });
      };

      if (this.empreinteGaucheCapturee()) addRecord('EMPREINTE_MAIN_GAUCHE', this.donneesService.empreintePlaceholder);
      if (this.empreinteDroiteCapturee()) addRecord('EMPREINTE_MAIN_DROITE', this.donneesService.empreintePlaceholder);
      if (this.empreintePoucesCapturee()) addRecord('EMPREINTE_POUCES', this.donneesService.empreintePlaceholder);
      if (this.capturedPhotoPourFormulaire()) addRecord('VISAGE', this.capturedPhotoPourFormulaire()!);

      if (nouvellesDonnees.length > 0) {
        toutesLesDonneesBio.push(...nouvellesDonnees);
      }

      this.tousLesVoyageurs.update(voyageurs =>
        voyageurs.filter(v => v.id !== voyageurAValider.id)
      );

      this.notificationService.show(`Voyageur "${voyageurAValider.nom_complet}" validé avec succès.`);
      this.isSaving.set(false);
      this.closeModals();
      if (this.voyageursPagines().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
    }, 1000);
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
  
  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
