import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { MotifVoyage } from '../../modeles/motif-voyage';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-motifs-voyages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './motifs-voyages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotifsVoyagesComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private tousLesMotifs = signal<MotifVoyage[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreStatut = signal('');

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  motifsFiltrees = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const statut = this.filtreStatut();

    return this.tousLesMotifs()
      .filter(m => !m.supprime)
      .filter(motif => {
        const parRecherche = recherche
          ? motif.libelle.toLowerCase().includes(recherche) ||
            (motif.description || '').toLowerCase().includes(recherche)
          : true;
        const parStatut = statut ? motif.statut === statut : true;
        return parRecherche && parStatut;
      });
  });
  
  totalPages = computed(() => Math.ceil(this.motifsFiltrees().length / this.itemsPerPage));
  
  motifsPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.motifsFiltrees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.motifsFiltrees().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 motifs";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} motifs`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedMotif = signal<MotifVoyage | null>(null);
  motifFormData = signal<Partial<MotifVoyage>>({});

  // --- Form State ---
  isSaving = signal(false);
  formErrors = signal<{ [key: string]: string }>({});
  statuts: ('ACTIF' | 'INACTIF')[] = ['ACTIF', 'INACTIF'];
  
  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesMotifs.set(this.donneesService.getMotifsVoyages());
  }
  
  getStatusClass(status: string): string {
    return status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  // --- Modal Management ---
  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.motifFormData.set({
      libelle: '',
      description: '',
      statut: 'ACTIF'
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(motif: MotifVoyage): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedMotif.set(motif);
    this.motifFormData.set({ ...motif });
    this.isAddEditModalOpen.set(true);
  }

  openDeleteModal(motif: MotifVoyage): void {
    this.selectedMotif.set(motif);
    this.isDeleteModalOpen.set(true);
  }

  openDetailsModal(motif: MotifVoyage): void {
    this.selectedMotif.set(motif);
    this.isDetailsModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedMotif.set(null);
    this.formErrors.set({});
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

  // --- CRUD Operations ---
  validateForm(): boolean {
    const formData = this.motifFormData();
    const errors: { [key: string]: string } = {};
    if (!formData.libelle?.trim()) errors['libelle'] = 'Le nom du motif est requis.';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveMotif(): void {
    if (!this.validateForm()) return;
    
    this.isSaving.set(true);

    setTimeout(() => {
      const formData = this.motifFormData();
      if (this.modalMode() === 'add') {
        const newId = Math.max(...this.tousLesMotifs().map(m => m.id)) + 1;
        const newMotif: MotifVoyage = {
          id: newId,
          libelle: formData.libelle!,
          description: formData.description || null,
          statut: formData.statut!,
          cree_par: 'Agent K. Bationo',
          supprime: false,
          date_creation: new Date().toISOString().split('T')[0],
          date_modification: null,
        };
        this.tousLesMotifs.update(motifs => [...motifs, newMotif]);
        this.notificationService.show('Motif de voyage ajouté avec succès.');
      } else {
        const motifToUpdate = this.selectedMotif();
        if (motifToUpdate) {
          this.tousLesMotifs.update(motifs =>
            motifs.map(m => (m.id === motifToUpdate.id ? { ...m, ...formData, date_modification: new Date().toISOString().split('T')[0] } as MotifVoyage : m))
          );
          this.notificationService.show('Motif de voyage mis à jour avec succès.');
        }
      }
      this.isSaving.set(false);
      this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const motifToDelete = this.selectedMotif();
    if (motifToDelete) {
      this.tousLesMotifs.update(motifs =>
        motifs.map(m => m.id === motifToDelete.id ? { ...m, supprime: true, date_modification: new Date().toISOString().split('T')[0] } : m)
      );
      this.notificationService.show(`Le motif "${motifToDelete.libelle}" a été supprimé.`, 'info');
      if (this.motifsPaginees().length === 0 && this.currentPage() > 1) {
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