import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Role } from '../../modeles/role';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './roles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private tousLesRoles = signal<Role[]>([]);

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  roles = computed(() => this.tousLesRoles().filter(r => !r.supprime));
  
  totalPages = computed(() => Math.ceil(this.roles().length / this.itemsPerPage));
  
  rolesPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.roles().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.roles().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 rôles";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} rôles`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedRole = signal<Role | null>(null);
  
  roleFormData = signal<Partial<Role>>({});

  // --- Form State ---
  isSaving = signal(false);
  formErrors = signal<{ [key: string]: string }>({});

  // --- Data for Form Dropdowns ---
  statuts: ('ACTIF' | 'INACTIF')[] = ['ACTIF', 'INACTIF'];
  niveauxAcces: number[] = [1, 2, 3, 4, 5, 6];

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesRoles.set(this.donneesService.getRoles());
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800';
      case 'INACTIF':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---

  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.roleFormData.set({
      nom_role: '',
      description: '',
      niveau_acces: 3,
      statut: 'ACTIF'
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(role: Role): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedRole.set(role);
    this.roleFormData.set({ ...role });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(role: Role): void {
    this.selectedRole.set(role);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(role: Role): void {
    this.selectedRole.set(role);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedRole.set(null);
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
    const formData = this.roleFormData();
    const errors: { [key: string]: string } = {};

    if (!formData.nom_role?.trim()) {
      errors['nom_role'] = 'Le nom du rôle est requis.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveRole(): void {
    if (!this.validateForm()) {
      return;
    }
    this.isSaving.set(true);
    
    // Simulate API call
    setTimeout(() => {
      const formData = this.roleFormData();
      if (this.modalMode() === 'add') {
        const newId = this.tousLesRoles().length > 0 ? Math.max(...this.tousLesRoles().map(r => r.id)) + 1 : 1;
        const newRole: Role = {
          id: newId,
          nom_role: formData.nom_role!,
          description: formData.description || null,
          niveau_acces: formData.niveau_acces!,
          statut: formData.statut!,
          cree_par: 'Adama KABORE', // Mocked user
          supprime: false,
          date_creation: new Date().toISOString().split('T')[0],
          date_modification: null,
        };
        this.tousLesRoles.update(roles => [...roles, newRole]);
        this.currentPage.set(this.totalPages());
        this.notificationService.show('Rôle ajouté avec succès.');
      } else {
        const roleToUpdate = this.selectedRole();
        if (roleToUpdate) {
          this.tousLesRoles.update(roles =>
            roles.map(r => (r.id === roleToUpdate.id ? { ...r, ...formData, date_modification: new Date().toISOString().split('T')[0] } as Role : r))
          );
          this.notificationService.show('Rôle mis à jour avec succès.');
        }
      }
      this.isSaving.set(false);
      this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const roleToDelete = this.selectedRole();
    if (roleToDelete) {
      this.tousLesRoles.update(roles =>
        roles.map(r => 
          r.id === roleToDelete.id 
          ? { ...r, supprime: true, date_modification: new Date().toISOString().split('T')[0] } 
          : r
        )
      );
      this.notificationService.show(`Le rôle "${roleToDelete.nom_role}" a été supprimé.`, 'info');
      // After deleting, check if the current page is now empty and go back if needed
      if (this.rolesPaginees().length === 0 && this.currentPage() > 1) {
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