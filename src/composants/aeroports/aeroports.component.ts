import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Aeroport } from '../../modeles/aeroport';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-aeroports',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './aeroports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AeroportsComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private tousLesAeroports = signal<Aeroport[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreVille = signal('');
  filtreStatut = signal('');

  aeroportsFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const ville = this.filtreVille();
    const statut = this.filtreStatut();

    return this.tousLesAeroports()
      .filter(a => !a.supprime)
      .filter(aeroport => {
        const parRecherche = recherche
          ? aeroport.nom_aeroport.toLowerCase().includes(recherche)
          : true;
        const parVille = ville ? aeroport.ville === ville : true;
        const parStatut = statut ? aeroport.statut === statut : true;
        return parRecherche && parVille && parStatut;
      });
  });

  villes = computed(() => {
    return [...new Set(this.tousLesAeroports().filter(a => !a.supprime).map(a => a.ville))];
  });
  
  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.aeroportsFiltres().length / this.itemsPerPage));
  
  aeroportsPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.aeroportsFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.aeroportsFiltres().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 aéroports";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} aéroports`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedAeroport = signal<Aeroport | null>(null);
  
  aeroportFormData = signal<Partial<Aeroport>>({});
  
  // --- Form State ---
  isSaving = signal(false);
  formErrors = signal<{ [key: string]: string }>({});

  // --- Data for Form Dropdowns ---
  statuts: ('ACTIF' | 'INACTIF' | 'MAINTENANCE')[] = ['ACTIF', 'INACTIF', 'MAINTENANCE'];

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesAeroports.set(this.donneesService.getAeroports());
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800';
      case 'INACTIF':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---

  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.aeroportFormData.set({
      nom_aeroport: '',
      ville: '',
      pays: '',
      statut: 'ACTIF'
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(aeroport: Aeroport): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedAeroport.set(aeroport);
    this.aeroportFormData.set({ ...aeroport });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(aeroport: Aeroport): void {
    this.selectedAeroport.set(aeroport);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(aeroport: Aeroport): void {
    this.selectedAeroport.set(aeroport);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedAeroport.set(null);
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
  validateAeroportForm(): boolean {
    const formData = this.aeroportFormData();
    const errors: { [key: string]: string } = {};

    if (!formData.nom_aeroport?.trim()) errors['nom_aeroport'] = 'Le nom de l\'aéroport est requis.';
    if (!formData.ville?.trim()) errors['ville'] = 'La ville est requise.';
    if (!formData.pays?.trim()) errors['pays'] = 'Le pays est requis.';

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveAeroport(): void {
    if (!this.validateAeroportForm()) return;

    this.isSaving.set(true);

    setTimeout(() => {
        const formData = this.aeroportFormData();
        if (this.modalMode() === 'add') {
          const newId = this.tousLesAeroports().length > 0 ? Math.max(...this.tousLesAeroports().map(a => a.id)) + 1 : 1;
          const newAeroport: Aeroport = {
            id: newId,
            nom_aeroport: formData.nom_aeroport!,
            ville: formData.ville!,
            pays: formData.pays!,
            statut: formData.statut!,
            cree_par: 'Adama KABORE', // Mocked user
            supprime: false,
            date_creation: new Date().toISOString().split('T')[0],
            date_modification: null,
          };
          this.tousLesAeroports.update(aeroports => [...aeroports, newAeroport]);
          this.currentPage.set(this.totalPages());
          this.notificationService.show('Aéroport ajouté avec succès.');
        } else {
          const aeroportToUpdate = this.selectedAeroport();
          if (aeroportToUpdate) {
            this.tousLesAeroports.update(aeroports =>
              aeroports.map(a => (a.id === aeroportToUpdate.id ? { ...a, ...formData, date_modification: new Date().toISOString().split('T')[0] } as Aeroport : a))
            );
            this.notificationService.show('Aéroport mis à jour avec succès.');
          }
        }
        this.isSaving.set(false);
        this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const aeroportToDelete = this.selectedAeroport();
    if (aeroportToDelete) {
      this.tousLesAeroports.update(aeroports =>
        aeroports.map(a => 
          a.id === aeroportToDelete.id 
          ? { ...a, supprime: true, date_modification: new Date().toISOString().split('T')[0] } 
          : a
        )
      );
      this.notificationService.show(`L'aéroport "${aeroportToDelete.nom_aeroport}" a été supprimé.`, 'info');
      if (this.aeroportsPagines().length === 0 && this.currentPage() > 1) {
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
