import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Utilisateur } from '../../modeles/utilisateur';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './utilisateurs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilisateursComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private tousLesUtilisateurs = signal<Utilisateur[]>([]);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreRole = signal('');
  filtreAeroport = signal('');

  // --- Filtered Data ---
  utilisateursFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase();
    const role = this.filtreRole();
    const aeroport = this.filtreAeroport();

    return this.tousLesUtilisateurs().filter(user => {
      const correspondRecherche = recherche ?
        `${user.prenom} ${user.nom}`.toLowerCase().includes(recherche) ||
        user.email.toLowerCase().includes(recherche)
        : true;

      const correspondRole = role ? user.role === role : true;
      const correspondAeroport = aeroport ? user.aeroport === aeroport : true;

      return correspondRecherche && correspondRole && correspondAeroport;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.utilisateursFiltres().length / this.itemsPerPage));
  
  utilisateursPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.utilisateursFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.utilisateursFiltres().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 utilisateurs";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} utilisateurs`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedUser = signal<Utilisateur | null>(null);
  
  userFormData = signal<Partial<Utilisateur>>({});

  // --- Form State ---
  isSaving = signal(false);
  formErrors = signal<{ [key: string]: string }>({});

  // --- Data for Form Dropdowns ---
  roles = signal<string[]>([]);
  aeroports = signal<string[]>([]);
  statuts: ('ACTIF' | 'INACTIF' | 'SUSPENDU')[] = ['ACTIF', 'INACTIF', 'SUSPENDU'];

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesUtilisateurs.set(this.donneesService.getUtilisateurs());
    this.roles.set([...new Set(this.donneesService.getRoles().map(r => r.nom_role))]);
    this.aeroports.set(this.donneesService.getAeroports().map(a => a.nom_aeroport));
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800';
      case 'INACTIF':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDU':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---

  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.userFormData.set({
      nom: '',
      prenom: '',
      email: '',
      role: 'Agent',
      aeroport: this.aeroports()[0] || '',
      statut: 'ACTIF'
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(user: Utilisateur): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedUser.set(user);
    this.userFormData.set({ ...user });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(user: Utilisateur): void {
    this.selectedUser.set(user);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(user: Utilisateur): void {
    this.selectedUser.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedUser.set(null);
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
  validateUserForm(): boolean {
    const formData = this.userFormData();
    const errors: { [key: string]: string } = {};

    if (!formData.prenom?.trim()) errors['prenom'] = 'Le prénom est requis.';
    if (!formData.nom?.trim()) errors['nom'] = 'Le nom est requis.';
    if (!formData.email?.trim()) {
        errors['email'] = 'L\'email est requis.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors['email'] = 'L\'adresse email est invalide.';
    }
    
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveUser(): void {
    if (!this.validateUserForm()) return;
    
    this.isSaving.set(true);

    setTimeout(() => {
        const formData = this.userFormData();

        if (this.modalMode() === 'add') {
          const newId = this.tousLesUtilisateurs().length > 0 ? Math.max(...this.tousLesUtilisateurs().map(u => u.id)) + 1 : 1;
          const newUser: Utilisateur = {
            id: newId,
            nom: formData.nom!,
            prenom: formData.prenom!,
            email: formData.email!,
            role: formData.role!,
            aeroport: formData.aeroport!,
            statut: formData.statut!,
            date_creation: new Date().toISOString().split('T')[0],
            desactive: formData.statut !== 'ACTIF',
            date_desactivation: formData.statut !== 'ACTIF' ? new Date().toISOString().split('T')[0] : null,
            cree_par: 'Système',
            date_modification: null,
          };
          this.tousLesUtilisateurs.update(users => [...users, newUser]);
          this.currentPage.set(this.totalPages());
          this.notificationService.show('Utilisateur ajouté avec succès.');
        } else {
          const userToUpdate = this.selectedUser();
          if (userToUpdate) {
            this.tousLesUtilisateurs.update(users =>
              users.map(u => {
                if (u.id === userToUpdate.id) {
                  const updatedUser = { ...u, ...formData } as Utilisateur;
                  updatedUser.date_modification = new Date().toISOString().split('T')[0];

                  if (formData.statut && formData.statut !== u.statut) {
                    updatedUser.desactive = formData.statut !== 'ACTIF';
                    updatedUser.date_desactivation = updatedUser.desactive ? new Date().toISOString().split('T')[0] : null;
                  }
                  return updatedUser;
                }
                return u;
              })
            );
            this.notificationService.show('Utilisateur mis à jour avec succès.');
          }
        }
        this.isSaving.set(false);
        this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const userToDelete = this.selectedUser();
    if (userToDelete) {
      this.tousLesUtilisateurs.update(users => users.filter(u => u.id !== userToDelete.id));
      this.notificationService.show(`L'utilisateur "${userToDelete.prenom} ${userToDelete.nom}" a été supprimé.`, 'info');
       if (this.utilisateursPagines().length === 0 && this.currentPage() > 1) {
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
