import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Vol } from '../../modeles/vol';
import { Compagnie } from '../../modeles/compagnie';
import { Aeroport } from '../../modeles/aeroport';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

// Interface pour l'affichage enrichi des vols
export interface VolAAfficher extends Vol {
  nom_compagnie: string;
  nom_aeroport: string;
}

@Component({
  selector: 'app-vols',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './vols.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolsComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  private tousLesVols = signal<Vol[]>([]);
  private compagnies = signal<Compagnie[]>([]);
  private aeroports = signal<Aeroport[]>([]);
  
  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');
  filtreStatut = signal('');

  // --- Data for Form Dropdowns ---
  statuts: ('PROGRAMME' | 'CONFIRME' | 'ANNULE' | 'RETARDE')[] = ['PROGRAMME', 'CONFIRME', 'ANNULE', 'RETARDE'];
  typesVol: ('ARRIVEE' | 'DEPART')[] = ['ARRIVEE', 'DEPART'];
  compagniesList = computed(() => this.compagnies().filter(c => !c.supprime && c.statut === 'ACTIVE'));
  aeroportsList = computed(() => this.aeroports().filter(a => !a.supprime && a.statut === 'ACTIF'));

  volsFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();
    const statut = this.filtreStatut();
    
    const compagniesMap = new Map(this.compagnies().map(c => [c.id, c.nom_compagnie]));
    const aeroportsMap = new Map(this.aeroports().map(a => [a.id, a.nom_aeroport]));

    return this.tousLesVols()
      .filter(vol => !vol.supprime)
      .map(vol => ({
        ...vol,
        nom_compagnie: compagniesMap.get(vol.compagnie_id) || 'Inconnue',
        nom_aeroport: aeroportsMap.get(vol.aeroport_id) || 'Inconnu'
      }))
      .filter(vol => {
        const parRecherche = recherche
          ? vol.numero_vol.toLowerCase().includes(recherche) ||
            vol.nom_compagnie.toLowerCase().includes(recherche) ||
            vol.ville_depart.toLowerCase().includes(recherche) ||
            vol.ville_arrivee.toLowerCase().includes(recherche)
          : true;
        
        const volDate = vol.date_depart.split('T')[0]; // YYYY-MM-DD
        const parDateDebut = dateDebut ? volDate >= dateDebut.split('T')[0] : true;
        const parDateFin = dateFin ? volDate <= dateFin.split('T')[0] : true;
        
        const parStatut = statut ? vol.statut === statut : true;
        
        return parRecherche && parDateDebut && parDateFin && parStatut;
      });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.volsFiltres().length / this.itemsPerPage));
  
  volsPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.volsFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.volsFiltres().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 vols";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} vols`;
  });

  // --- State for Modals ---
  isAddEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  selectedVol = signal<VolAAfficher | null>(null);
  volFormData = signal<Partial<Vol>>({});
  
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
    this.tousLesVols.set(this.donneesService.getVols());
    this.compagnies.set(this.donneesService.getCompagnies());
    this.aeroports.set(this.donneesService.getAeroports());
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'PROGRAMME': return 'bg-cyan-100 text-cyan-800';
      case 'CONFIRME': return 'bg-green-100 text-green-800';
      case 'ANNULE': return 'bg-red-100 text-red-800';
      case 'RETARDE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---
  openAddModal(): void {
    this.modalMode.set('add');
    this.formErrors.set({});
    this.volFormData.set({
      numero_vol: '',
      compagnie_id: this.compagniesList()[0]?.id,
      aeroport_id: this.aeroportsList()[0]?.id,
      ville_depart: '',
      ville_arrivee: '',
      date_depart: '',
      date_arrivee: '',
      statut: 'PROGRAMME',
      type_vol: 'DEPART',
    });
    this.isAddEditModalOpen.set(true);
  }

  openEditModal(vol: VolAAfficher): void {
    this.modalMode.set('edit');
    this.formErrors.set({});
    this.selectedVol.set(vol);
    this.volFormData.set({ ...vol });
    this.isAddEditModalOpen.set(true);
  }
  
  openDetailsModal(vol: VolAAfficher): void {
    this.selectedVol.set(vol);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(vol: VolAAfficher): void {
    this.selectedVol.set(vol);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isAddEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedVol.set(null);
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
  validateVolForm(): boolean {
    const formData = this.volFormData();
    const errors: { [key: string]: string } = {};

    if (!formData.numero_vol?.trim()) errors['numero_vol'] = 'Le numéro de vol est requis.';
    if (!formData.ville_depart?.trim()) errors['ville_depart'] = 'La ville de départ est requise.';
    if (!formData.ville_arrivee?.trim()) errors['ville_arrivee'] = 'La ville d\'arrivée est requise.';
    if (!formData.date_depart) errors['date_depart'] = 'La date de départ est requise.';
    if (!formData.date_arrivee) errors['date_arrivee'] = 'La date d\'arrivée est requise.';
    
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveVol(): void {
    if (!this.validateVolForm()) return;
    
    this.isSaving.set(true);

    setTimeout(() => {
      const formData = this.volFormData();
      if (this.modalMode() === 'add') {
        const newId = this.tousLesVols().length > 0 ? Math.max(...this.tousLesVols().map(v => v.id)) + 1 : 1;
        const newVol: Vol = {
          id: newId,
          numero_vol: formData.numero_vol!,
          compagnie_id: formData.compagnie_id!,
          aeroport_id: formData.aeroport_id!,
          ville_depart: formData.ville_depart!,
          ville_arrivee: formData.ville_arrivee!,
          date_depart: formData.date_depart!,
          date_arrivee: formData.date_arrivee!,
          statut: formData.statut!,
          type_vol: formData.type_vol!,
          cree_par: 'Adama KABORE',
          supprime: false,
          date_creation: new Date().toISOString().split('T')[0],
          date_modification: null,
        };
        this.tousLesVols.update(vols => [...vols, newVol]);
        this.currentPage.set(this.totalPages());
        this.notificationService.show('Vol ajouté avec succès.');
      } else {
        const volToUpdate = this.selectedVol();
        if (volToUpdate) {
          this.tousLesVols.update(vols =>
            vols.map(v => v.id === volToUpdate.id ? { ...v, ...formData, date_modification: new Date().toISOString().split('T')[0] } as Vol : v)
          );
          this.notificationService.show('Vol mis à jour avec succès.');
        }
      }
      this.isSaving.set(false);
      this.closeModals();
    }, 1000);
  }

  confirmDelete(): void {
    const volToDelete = this.selectedVol();
    if (volToDelete) {
      this.tousLesVols.update(vols =>
        vols.map(v => v.id === volToDelete.id ? { ...v, supprime: true, date_modification: new Date().toISOString().split('T')[0] } : v)
      );
      this.notificationService.show(`Le vol "${volToDelete.numero_vol}" a été supprimé.`, 'info');
      if (this.volsPagines().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
    }
    this.closeModals();
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
