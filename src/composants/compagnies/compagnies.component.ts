import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Compagnie } from '../../modeles/compagnie';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-compagnies',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './compagnies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompagniesComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private toutesLesCompagnies = signal<Compagnie[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtrePays = signal('');
  filtreStatut = signal('');

  // --- Computed data for filters and table ---
  pays = computed(() => [...new Set(this.toutesLesCompagnies().filter(c => !c.supprime).map(c => c.pays_compagnie))]);
  statuts: ('ACTIVE' | 'INACTIVE' | 'SUSPENDUE')[] = ['ACTIVE', 'INACTIVE', 'SUSPENDUE'];

  compagniesFiltrees = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const pays = this.filtrePays();
    const statut = this.filtreStatut();

    return this.toutesLesCompagnies()
      .filter(c => !c.supprime)
      .filter(compagnie => {
        const parRecherche = recherche ? compagnie.nom_compagnie.toLowerCase().includes(recherche) : true;
        const parPays = pays ? compagnie.pays_compagnie === pays : true;
        const parStatut = statut ? compagnie.statut === statut : true;
        return parRecherche && parPays && parStatut;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.compagniesFiltrees().length / this.itemsPerPage));
  
  compagniesPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.compagniesFiltrees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.compagniesFiltrees().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 compagnies";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} compagnies`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedCompagnie = signal<Compagnie | null>(null);
  
  compagnieFormData = signal<Partial<Compagnie>>({});

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
    this.toutesLesCompagnies.set(this.donneesService.getCompagnies());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---

  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.compagnieFormData.set({
      nom_compagnie: '',
      pays_compagnie: '',
      statut: 'ACTIVE'
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(compagnie: Compagnie): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedCompagnie.set(compagnie);
    this.compagnieFormData.set({ ...compagnie });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(compagnie: Compagnie): void {
    this.selectedCompagnie.set(compagnie);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(compagnie: Compagnie): void {
    this.selectedCompagnie.set(compagnie);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedCompagnie.set(null);
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
  validateCompagnieForm(): boolean {
    const formData = this.compagnieFormData();
    const errors: { [key: string]: string } = {};

    if (!formData.nom_compagnie?.trim()) errors['nom_compagnie'] = 'Le nom de la compagnie est requis.';
    if (!formData.pays_compagnie?.trim()) errors['pays_compagnie'] = 'Le pays est requis.';

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveCompagnie(): void {
    if (!this.validateCompagnieForm()) return;
    
    this.isSaving.set(true);
    
    setTimeout(() => {
        const formData = this.compagnieFormData();
        if (this.modalMode() === 'add') {
          const newId = this.toutesLesCompagnies().length > 0 ? Math.max(...this.toutesLesCompagnies().map(c => c.id)) + 1 : 1;
          const newCompagnie: Compagnie = {
            id: newId,
            nom_compagnie: formData.nom_compagnie!,
            pays_compagnie: formData.pays_compagnie!,
            statut: formData.statut!,
            cree_par: 'Adama KABORE', // Mocked user
            supprime: false,
            date_creation: new Date().toISOString().split('T')[0],
            date_modification: null,
          };
          this.toutesLesCompagnies.update(compagnies => [...compagnies, newCompagnie]);
          this.currentPage.set(this.totalPages());
          this.notificationService.show('Compagnie ajoutée avec succès.');
        } else {
          const compagnieToUpdate = this.selectedCompagnie();
          if (compagnieToUpdate) {
            this.toutesLesCompagnies.update(compagnies =>
              compagnies.map(c => (c.id === compagnieToUpdate.id ? { ...c, ...formData, date_modification: new Date().toISOString().split('T')[0] } as Compagnie : c))
            );
            this.notificationService.show('Compagnie mise à jour avec succès.');
          }
        }
        this.isSaving.set(false);
        this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const compagnieToDelete = this.selectedCompagnie();
    if (compagnieToDelete) {
       this.toutesLesCompagnies.update(compagnies =>
        compagnies.map(c => 
          c.id === compagnieToDelete.id 
          ? { ...c, supprime: true, date_modification: new Date().toISOString().split('T')[0] } 
          : c
        )
      );
      this.notificationService.show(`La compagnie "${compagnieToDelete.nom_compagnie}" a été supprimée.`, 'info');
      if (this.compagniesPaginees().length === 0 && this.currentPage() > 1) {
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
