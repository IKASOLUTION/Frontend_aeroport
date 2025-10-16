import { ChangeDetectionStrategy, Component, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { PersonneListeNoire } from '../../modeles/liste-noire';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-liste-noire',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './liste-noire.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListeNoireComponent implements AfterViewChecked {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private toutesLesPersonnes = signal<PersonneListeNoire[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreStatut = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Data for filters ---
  statuts: ('ACTIVE' | 'LEVEE')[] = ['ACTIVE', 'LEVEE'];

  personnesFiltrees = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const statut = this.filtreStatut();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.toutesLesPersonnes()
      .filter(p => !p.supprime)
      .filter(personne => {
        const parRecherche = recherche
          ? `${personne.prenom} ${personne.nom_famille}`.toLowerCase().includes(recherche) ||
            personne.motif_interdiction.toLowerCase().includes(recherche)
          : true;
        const parStatut = statut ? personne.statut === statut : true;
        
        const personneDate = personne.date_creation;
        const parDateDebut = dateDebut ? personneDate >= dateDebut : true;
        const parDateFin = dateFin ? personneDate <= dateFin : true;

        return parRecherche && parStatut && parDateDebut && parDateFin;
      });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.personnesFiltrees().length / this.itemsPerPage));
  
  personnesPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.personnesFiltrees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.personnesFiltrees().length;
    if (total === 0) return "Affichage de 0 à 0 sur 0 personnes";
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} personnes`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  isCameraModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedPersonne = signal<PersonneListeNoire | null>(null);
  personneFormData = signal<Partial<PersonneListeNoire>>({});
  
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
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.toutesLesPersonnes.set(this.donneesService.getListeNoire());
  }

  ngAfterViewChecked(): void {
    if (this.videoElement && this.webcamStream()) {
      this.videoElement.nativeElement.srcObject = this.webcamStream();
    }
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  }

  // --- Modal Management ---
  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.personneFormData.set({
      nom_famille: '',
      prenom: '',
      date_naissance: '',
      lieu_naissance: '',
      motif_interdiction: '',
      photo_profil: null,
      statut: 'ACTIVE',
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(personne: PersonneListeNoire): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedPersonne.set(personne);
    this.personneFormData.set({ ...personne });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(personne: PersonneListeNoire): void {
    this.selectedPersonne.set(personne);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(personne: PersonneListeNoire): void {
    this.selectedPersonne.set(personne);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedPersonne.set(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.webcamStream.set(stream);
      this.capturedPhotoBase64.set(null);
      this.isCameraModalOpen.set(true);
    } catch (err) {
      this.notificationService.show("Impossible d'accéder à la webcam.", "error");
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
    this.personneFormData.update(form => ({ ...form, photo_profil: this.capturedPhotoBase64() }));
    this.arreterCamera();
  }

  // --- CRUD Operations ---
  validateForm(): boolean {
    const formData = this.personneFormData();
    const errors: { [key: string]: string } = {};
    if (!formData.prenom?.trim()) errors['prenom'] = 'Le prénom est requis.';
    if (!formData.nom_famille?.trim()) errors['nom_famille'] = 'Le nom de famille est requis.';
    if (!formData.date_naissance) errors['date_naissance'] = 'La date de naissance est requise.';
    if (!formData.lieu_naissance?.trim()) errors['lieu_naissance'] = 'Le lieu de naissance est requis.';
    if (!formData.motif_interdiction?.trim()) errors['motif_interdiction'] = 'Le motif est requis.';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  savePersonne(): void {
    if (!this.validateForm()) return;
    this.isSaving.set(true);
    setTimeout(() => {
      const formData = this.personneFormData();
      if (this.modalMode() === 'add') {
        const newId = Math.max(...this.toutesLesPersonnes().map(p => p.id)) + 1;
        const newPersonne: PersonneListeNoire = {
          id: newId,
          nom_famille: formData.nom_famille!,
          prenom: formData.prenom!,
          date_naissance: formData.date_naissance!,
          lieu_naissance: formData.lieu_naissance!,
          motif_interdiction: formData.motif_interdiction!,
          photo_profil: formData.photo_profil || null,
          donnees_biometriques_id: null,
          statut: formData.statut!,
          cree_par: 'Agent K. Bationo',
          supprime: false,
          date_creation: new Date().toISOString().split('T')[0],
          date_modification: null,
        };
        this.toutesLesPersonnes.update(personnes => [...personnes, newPersonne]);
        this.notificationService.show('Personne ajoutée à la liste noire.');
      } else {
        const personneToUpdate = this.selectedPersonne();
        if (personneToUpdate) {
          this.toutesLesPersonnes.update(personnes =>
            personnes.map(p => p.id === personneToUpdate.id ? { ...p, ...formData, date_modification: new Date().toISOString().split('T')[0] } as PersonneListeNoire : p)
          );
          this.notificationService.show('Informations mises à jour avec succès.');
        }
      }
      this.isSaving.set(false);
      this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const personneToDelete = this.selectedPersonne();
    if (personneToDelete) {
      this.toutesLesPersonnes.update(personnes =>
        personnes.map(p => p.id === personneToDelete.id ? { ...p, supprime: true, date_modification: new Date().toISOString().split('T')[0] } : p)
      );
      this.notificationService.show(`"${personneToDelete.prenom} ${personneToDelete.nom_famille}" a été supprimé(e).`, 'info');
      if (this.personnesPaginees().length === 0 && this.currentPage() > 1) {
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
